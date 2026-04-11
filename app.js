// ============================================================
//  APP.JS — Auth + 3D Engine + Particles + Homepage
//  v4 — Persistent login + latest device wins
// ============================================================

/* ================================================================
   AUTH BACKEND
   
   HOW CROSS-DEVICE SINGLE-SESSION WORKS:
   - Each user record stores a "deviceToken" in localStorage (users DB)
   - When you log in, a new token is generated and saved to the user record
   - Your session also stores that token
   - On EVERY page load, your session token is compared to the stored token
   - If another device logged in later → their token overwrote yours
   - Your old token no longer matches → you get auto logged out
   - The LATEST login always wins ✅
   
   NOTE: Since localStorage is per-browser, cross-device sync works
   because all users share the same users DB key on the same domain.
   Both devices read/write to the SAME localStorage on classnow.iampro.top
   ================================================================ */

const Auth = {
  getUsers()   { return JSON.parse(localStorage.getItem('cn_users') || '[]'); },
  saveUsers(u) { localStorage.setItem('cn_users', JSON.stringify(u)); },

  // Session in localStorage → persists after browser close
  getSession() { return JSON.parse(localStorage.getItem('cn_session') || 'null'); },
  saveSession(s) { localStorage.setItem('cn_session', JSON.stringify(s)); },
  clearSession() { localStorage.removeItem('cn_session'); },

  // Generate unique device token
  genToken() {
    return btoa(Math.random().toString(36) + Date.now() + Math.random().toString(36)).replace(/=/g,'');
  },

  register(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered.' };
    const deviceToken = this.genToken();
    const user = {
      id: Date.now(),
      name, email,
      password: btoa(password),
      deviceToken,   // latest valid token
      joinedAt: new Date().toISOString()
    };
    users.push(user);
    this.saveUsers(users);
    // Save session with token
    this.saveSession({ id: user.id, name, email, deviceToken });
    return { ok: true };
  },

  login(email, password) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.email === email && u.password === btoa(password));
    if (idx === -1) return { ok: false, msg: 'Incorrect email or password.' };

    // Generate new token — this KICKS OUT any previously logged-in device
    const deviceToken = this.genToken();
    users[idx].deviceToken = deviceToken;  // overwrite old token
    this.saveUsers(users);

    // Save new session
    this.saveSession({ id: users[idx].id, name: users[idx].name, email, deviceToken });
    return { ok: true, user: users[idx] };
  },

  logout() {
    const session = this.getSession();
    if (session) {
      // Invalidate token in user record
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === session.id);
      if (idx !== -1) {
        users[idx].deviceToken = null;
        this.saveUsers(users);
      }
    }
    this.clearSession();
  },

  isLoggedIn() {
    const session = this.getSession();
    if (!session) return false;
    // Check if token still matches (no other device logged in after us)
    const users = this.getUsers();
    const user = users.find(u => u.id === session.id);
    if (!user) { this.clearSession(); return false; }
    if (user.deviceToken !== session.deviceToken) {
      // Another device logged in — our session is now invalid
      this.clearSession();
      return false;
    }
    return true;
  },

  currentUser() {
    if (!this.isLoggedIn()) return null;
    return this.getSession();
  }
};

function logout() {
  Auth.logout();
  showToast('Logged out successfully.', 'success');
  setTimeout(() => location.href = 'index.html', 900);
}

/* ================================================================
   AUTO-KICK CHECK — runs on every page load
   If this device was kicked by another login, redirect to login page
   ================================================================ */
function checkSessionValidity() {
  const session = localStorage.getItem('cn_session');
  if (!session) return; // not logged in, nothing to check

  const parsed = JSON.parse(session);
  const users = JSON.parse(localStorage.getItem('cn_users') || '[]');
  const user = users.find(u => u.id === parsed.id);

  if (!user || user.deviceToken !== parsed.deviceToken) {
    // Kicked out — clear session and notify
    localStorage.removeItem('cn_session');
    // Only redirect if on a protected page
    if (window.location.pathname.includes('classes.html')) {
      alert('⚠️ Your account was logged in from another device. You have been logged out.');
      window.location.href = 'login.html';
    }
  }
}

/* ---- NAV AUTH STATE ---- */
function initNavAuth() {
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const userNameEl = document.getElementById('userName');
  if (!navAuth) return;
  if (Auth.isLoggedIn()) {
    const u = Auth.currentUser();
    navAuth.classList.add('hidden');
    navUser.classList.remove('hidden');
    if (userNameEl) userNameEl.textContent = u.name.split(' ')[0];
  }
}

/* ---- NAVBAR SCROLL ---- */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ---- HAMBURGER ---- */
document.getElementById('hamburger')?.addEventListener('click', () => {
  document.getElementById('mobileMenu')?.classList.toggle('hidden');
});

/* ================================================================
   3D PARTICLE SYSTEM
   ================================================================ */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts, mouse = { x: -9999, y: -9999 };

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildPts();
  };

  const buildPts = () => {
    const n = Math.min(90, Math.floor(W * H / 10000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.4,
    }));
  };

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 160) {
        p.vx += dx / dist * 0.012;
        p.vy += dy / dist * 0.012;
      }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      const alpha = 0.08 + p.z * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.5 + p.z * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,198,255,${alpha})`;
      ctx.fill();

      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) {
          const lineAlpha = (1 - d / 130) * 0.07;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,198,255,${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  };

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
}

/* ================================================================
   3D TILT ENGINE
   ================================================================ */
function initTiltCards() {
  const TILT_MAX = 18;
  const SCALE = 1.04;

  document.querySelectorAll('.tilt-card').forEach(card => {
    if (!card.querySelector('.card-shine')) {
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      card.style.position = 'relative';
      card.appendChild(shine);
    }

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotY =  dx * TILT_MAX;
      const rotX = -dy * TILT_MAX;

      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${SCALE})`;
      card.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5}px 50px rgba(0,0,0,0.5), 0 0 40px rgba(0,198,255,0.15)`;
      card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';

      const shine = card.querySelector('.card-shine');
      if (shine) {
        const px = ((e.clientX - rect.left) / rect.width) * 100;
        const py = ((e.clientY - rect.top)  / rect.height) * 100;
        shine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.1), transparent 60%)`;
        shine.style.opacity = '1';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      card.style.boxShadow = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1), box-shadow 0.5s ease';
      const shine = card.querySelector('.card-shine');
      if (shine) shine.style.opacity = '0';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease';
    });
  });
}

/* ================================================================
   SCROLL REVEAL
   ================================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ================================================================
   RENDER HOMEPAGE CONTENT
   ================================================================ */
function renderRecent() {
  const grid = document.getElementById('recentGrid');
  if (!grid || !window.RECENT_CLASSES) return;
  grid.innerHTML = RECENT_CLASSES.map((c, i) => `
    <div class="recent-card tilt-card reveal reveal-delay-${(i%3)+1}" onclick="openClass(${c.id})">
      <div class="recent-card-inner">
        <div class="recent-thumb">
          <img src="${c.thumb}" alt="${c.title}" loading="lazy" onerror="this.parentNode.style.background='var(--surface2)'"/>
          <div class="thumb-play"><span>▶</span></div>
        </div>
        <div class="recent-body">
          ${c.isNew ? '<span class="recent-badge new-badge">🆕 New</span>' : `<span class="recent-badge">${c.subject}</span>`}
          <div class="recent-title">${c.title}</div>
          <div class="recent-meta">👨‍🏫 ${c.lecturer} &nbsp;·&nbsp; 📅 ${fmtDate(c.date)}</div>
        </div>
      </div>
    </div>
  `).join('');
  initTiltCards();
  initScrollReveal();
}

function openClass(id) {
  if (!Auth.isLoggedIn()) {
    showToast('Please login to watch classes.', 'error');
    setTimeout(() => location.href = 'login.html', 1100);
    return;
  }
  const cls = RECENT_CLASSES.find(c => c.id == id);
  if (cls) localStorage.setItem('cn_play_video', JSON.stringify({ videoId: cls.videoId, title: cls.title }));
  location.href = 'classes.html';
}

function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  if (!grid || !window.COURSES) return;
  grid.innerHTML = COURSES.map((c, i) => `
    <div class="course-card tilt-card reveal reveal-delay-${(i%3)+1}">
      <div class="course-header">
        <div class="course-icon-wrap" style="background:${c.color}18; box-shadow: 0 0 20px ${c.color}30;">
          <span style="color:${c.color}; filter: drop-shadow(0 0 8px ${c.color}88);">${c.icon}</span>
        </div>
        <div class="course-title">${c.title}</div>
        <div class="course-desc">${c.description}</div>
        <div class="course-meta">
          <span class="meta-item">📹 ${c.lectures} Lectures</span>
          <span class="meta-item">⏱ ${c.duration}</span>
        </div>
      </div>
      <div class="course-footer">
        <div class="price-wrap">
          <span class="price-orig">৳${c.originalPrice}</span>
          <span class="price-now">৳${c.price}</span>
          <span class="price-currency">BDT</span>
        </div>
        <button class="btn-enroll"
          style="background:linear-gradient(135deg,${c.color},${c.colorDark}); box-shadow: 0 6px 20px ${c.color}50;"
          onclick="enrollCourse('${c.id}')">Enroll Now</button>
      </div>
    </div>
  `).join('');
  initTiltCards();
  initScrollReveal();
}

function enrollCourse(id) {
  if (!Auth.isLoggedIn()) {
    showToast('Please login or sign up to enroll.', 'error');
    setTimeout(() => location.href = 'signup.html', 1000);
    return;
  }
  localStorage.setItem('cn_active_course', id);
  location.href = 'classes.html';
}

function initContactTilt() {
  document.querySelectorAll('.contact-card').forEach(el => {
    el.classList.add('tilt-card');
  });
  initTiltCards();
}

/* ================================================================
   SMOOTH SCROLL
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ================================================================
   TOAST
   ================================================================ */
function showToast(msg, type = 'info') {
  let toast = document.getElementById('globalToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'globalToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  toast.className = `toast ${type}`;
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  checkSessionValidity(); // check if kicked by another device
  initNavAuth();
  initParticles();
  renderRecent();
  renderCourses();
  initContactTilt();
  initScrollReveal();

  document.querySelector('.about-card')?.classList.add('reveal');
  document.querySelectorAll('.contact-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${i+1}`);
  });
  initScrollReveal();
});
