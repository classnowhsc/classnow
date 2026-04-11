// ============================================================
//  APP.JS — Auth + 3D Engine + Particles + Homepage
//  v5 — Mobile fixes + persistent login + hamburger
// ============================================================

/* ================================================================
   AUTH BACKEND
   ================================================================ */
const Auth = {
  getUsers()     { return JSON.parse(localStorage.getItem('cn_users') || '[]'); },
  saveUsers(u)   { localStorage.setItem('cn_users', JSON.stringify(u)); },
  getSession()   { return JSON.parse(localStorage.getItem('cn_session') || 'null'); },
  saveSession(s) { localStorage.setItem('cn_session', JSON.stringify(s)); },
  clearSession() { localStorage.removeItem('cn_session'); },

  genToken() {
    return btoa(Math.random().toString(36) + Date.now() + Math.random().toString(36)).replace(/=/g, '');
  },

  register(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered.' };
    const deviceToken = this.genToken();
    const user = {
      id: Date.now(), name, email,
      password: btoa(unescape(encodeURIComponent(password))), // safe encoding for all characters
      deviceToken,
      joinedAt: new Date().toISOString()
    };
    users.push(user);
    this.saveUsers(users);
    this.saveSession({ id: user.id, name, email, deviceToken });
    return { ok: true };
  },

  login(email, password) {
    const users = this.getUsers();
    // Safe encode password the same way as registration
    const encoded = btoa(unescape(encodeURIComponent(password)));
    const idx = users.findIndex(u => u.email === email && u.password === encoded);
    if (idx === -1) return { ok: false, msg: 'Incorrect email or password.' };

    // New token — kicks out any other device
    const deviceToken = this.genToken();
    users[idx].deviceToken = deviceToken;
    this.saveUsers(users);
    this.saveSession({ id: users[idx].id, name: users[idx].name, email, deviceToken });
    return { ok: true, user: users[idx] };
  },

  logout() {
    const session = this.getSession();
    if (session) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === session.id);
      if (idx !== -1) { users[idx].deviceToken = null; this.saveUsers(users); }
    }
    this.clearSession();
  },

  isLoggedIn() {
    const session = this.getSession();
    if (!session) return false;
    const user = this.getUsers().find(u => u.id === session.id);
    if (!user) { this.clearSession(); return false; }
    if (user.deviceToken !== session.deviceToken) { this.clearSession(); return false; }
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
   SESSION VALIDITY CHECK
   ================================================================ */
function checkSessionValidity() {
  const raw = localStorage.getItem('cn_session');
  if (!raw) return;
  const session = JSON.parse(raw);
  const users = JSON.parse(localStorage.getItem('cn_users') || '[]');
  const user = users.find(u => u.id === session.id);
  if (!user || user.deviceToken !== session.deviceToken) {
    localStorage.removeItem('cn_session');
    if (window.location.pathname.includes('classes.html')) {
      showToast('Logged in from another device. Please login again.', 'error');
      setTimeout(() => window.location.href = 'login.html', 1500);
    }
  }
}

/* ================================================================
   NAV AUTH STATE — desktop + mobile
   ================================================================ */
function initNavAuth() {
  const navAuth   = document.getElementById('navAuth');
  const navUser   = document.getElementById('navUser');
  const userNameEl = document.getElementById('userName');
  const mobAuth   = document.getElementById('mobAuthLinks');
  const mobUser   = document.getElementById('mobUserLinks');
  const mobName   = document.getElementById('mobUserName');

  const loggedIn = Auth.isLoggedIn();
  const u = loggedIn ? Auth.currentUser() : null;
  const firstName = u ? u.name.split(' ')[0] : '';

  // Desktop nav
  if (navAuth) {
    if (loggedIn) {
      navAuth.classList.add('hidden');
      navUser?.classList.remove('hidden');
      if (userNameEl) userNameEl.textContent = firstName;
    } else {
      navAuth.classList.remove('hidden');
      navUser?.classList.add('hidden');
    }
  }

  // Mobile menu
  if (mobAuth && mobUser) {
    if (loggedIn) {
      mobAuth.style.display = 'none';
      mobUser.style.display = 'flex';
      if (mobName) mobName.textContent = firstName;
    } else {
      mobAuth.style.display = 'flex';
      mobAuth.style.flexDirection = 'column';
      mobAuth.style.gap = '4px';
      mobUser.style.display = 'none';
    }
  }
}

/* ================================================================
   HAMBURGER MENU
   ================================================================ */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      menu.classList.add('hidden');
      btn.innerHTML = '&#9776;';
    } else {
      menu.classList.remove('hidden');
      btn.innerHTML = '&#10005;'; // X when open
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.classList.contains('hidden') &&
        !menu.contains(e.target) &&
        e.target !== btn) {
      menu.classList.add('hidden');
      btn.innerHTML = '&#9776;';
    }
  });

  // Close on scroll
  window.addEventListener('scroll', () => {
    if (!menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      btn.innerHTML = '&#9776;';
    }
  }, { passive: true });
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn  = document.getElementById('hamburger');
  if (menu) menu.classList.add('hidden');
  if (btn)  btn.innerHTML = '&#9776;';
}

/* ================================================================
   NAVBAR SCROLL
   ================================================================ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

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
    const n = Math.min(60, Math.floor(W * H / 14000)); // fewer on mobile
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.4,
    }));
  };

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });

  // Touch support for particles
  document.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 160) { p.vx += dx / dist * 0.012; p.vy += dy / dist * 0.012; }
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.5 + p.z * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,198,255,${0.08 + p.z * 0.22})`;
      ctx.fill();

      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,198,255,${(1 - d / 120) * 0.06})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  };

  resize(); draw();
  window.addEventListener('resize', resize, { passive: true });
}

/* ================================================================
   3D TILT ENGINE (disabled on touch devices)
   ================================================================ */
function initTiltCards() {
  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  if (isTouchDevice) return; // skip tilt on phones

  const TILT_MAX = 16, SCALE = 1.03;

  document.querySelectorAll('.tilt-card').forEach(card => {
    if (!card.querySelector('.card-shine')) {
      const shine = document.createElement('div');
      shine.className = 'card-shine';
      card.style.position = 'relative';
      card.appendChild(shine);
    }
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const dy = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      card.style.transform = `perspective(900px) rotateX(${-dy * TILT_MAX}deg) rotateY(${dx * TILT_MAX}deg) scale(${SCALE})`;
      card.style.transition = 'transform 0.08s ease';
      const shine = card.querySelector('.card-shine');
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%, rgba(255,255,255,0.1), transparent 60%)`;
        shine.style.opacity = '1';
      }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
      const shine = card.querySelector('.card-shine');
      if (shine) shine.style.opacity = '0';
    });
  });
}

/* ================================================================
   SCROLL REVEAL
   ================================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

/* ================================================================
   RENDER HOMEPAGE CONTENT
   ================================================================ */
function renderRecent() {
  const grid = document.getElementById('recentGrid');
  if (!grid || !window.RECENT_CLASSES) return;
  grid.innerHTML = RECENT_CLASSES.map((c, i) => `
    <div class="recent-card tilt-card reveal reveal-delay-${(i % 3) + 1}" onclick="openClass(${c.id})">
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
    </div>`).join('');
  initTiltCards(); initScrollReveal();
}

function openClass(id) {
  if (!Auth.isLoggedIn()) {
    showToast('Please login to watch classes.', 'error');
    setTimeout(() => location.href = 'login.html', 1100); return;
  }
  const cls = RECENT_CLASSES.find(c => c.id == id);
  if (cls) localStorage.setItem('cn_play_video', JSON.stringify({ videoId: cls.videoId, title: cls.title }));
  location.href = 'classes.html';
}

function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  if (!grid || !window.COURSES) return;
  grid.innerHTML = COURSES.map((c, i) => `
    <div class="course-card tilt-card reveal reveal-delay-${(i % 3) + 1}">
      <div class="course-header">
        <div class="course-icon-wrap" style="background:${c.color}18; box-shadow:0 0 20px ${c.color}30;">
          <span style="color:${c.color}; filter:drop-shadow(0 0 8px ${c.color}88);">${c.icon}</span>
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
          style="background:linear-gradient(135deg,${c.color},${c.colorDark});box-shadow:0 6px 20px ${c.color}50;"
          onclick="enrollCourse('${c.id}')">Enroll Now</button>
      </div>
    </div>`).join('');
  initTiltCards(); initScrollReveal();
}

function enrollCourse(id) {
  if (!Auth.isLoggedIn()) {
    showToast('Please login to enroll.', 'error');
    setTimeout(() => location.href = 'signup.html', 1000); return;
  }
  localStorage.setItem('cn_active_course', id);
  location.href = 'classes.html';
}

function initContactTilt() {
  document.querySelectorAll('.contact-card').forEach(el => el.classList.add('tilt-card'));
  initTiltCards();
}

/* Smooth scroll */
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
  toast.innerHTML = `<span>${{success:'✅',error:'❌',info:'ℹ️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
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
  checkSessionValidity();
  initNavAuth();
  initHamburger();
  initParticles();
  renderRecent();
  renderCourses();
  initContactTilt();
  initScrollReveal();

  document.querySelector('.about-card')?.classList.add('reveal');
  document.querySelectorAll('.contact-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${i + 1}`);
  });
  initScrollReveal();
});
