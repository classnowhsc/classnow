// ============================================================
//  APP.JS — Auth + 3D Engine + Particles + Homepage
// ============================================================

/* ---- AUTH BACKEND ---- */
const Auth = {
  getUsers()  { return JSON.parse(localStorage.getItem('cn_users') || '[]'); },
  saveUsers(u){ localStorage.setItem('cn_users', JSON.stringify(u)); },
  getSession(){ return JSON.parse(sessionStorage.getItem('cn_session') || 'null'); },
  saveSession(u){ sessionStorage.setItem('cn_session', JSON.stringify(u)); },
  clearSession(){ sessionStorage.removeItem('cn_session'); },

  register(name, email, password) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email already registered.' };
    const user = { id: Date.now(), name, email, password: btoa(password), joinedAt: new Date().toISOString() };
    users.push(user); this.saveUsers(users);
    this.saveSession({ id: user.id, name, email });
    return { ok: true };
  },
  login(email, password) {
    const user = this.getUsers().find(u => u.email === email && u.password === btoa(password));
    if (!user) return { ok: false, msg: 'Incorrect email or password.' };
    this.saveSession({ id: user.id, name: user.name, email: user.email });
    return { ok: true, user };
  },
  isLoggedIn() { return !!this.getSession(); },
  currentUser() { return this.getSession(); }
};

function logout() {
  Auth.clearSession();
  showToast('Logged out successfully.', 'success');
  setTimeout(() => location.href = 'index.html', 900);
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
      z: Math.random(), // depth
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
      // Subtle mouse attraction
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 160) {
        p.vx += dx / dist * 0.012;
        p.vy += dy / dist * 0.012;
      }
      // Dampen
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      const alpha = 0.08 + p.z * 0.25;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.5 + p.z * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,198,255,${alpha})`;
      ctx.fill();

      // Lines to neighbours
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
   3D TILT ENGINE — mouse-tracked per card
   ================================================================ */
function initTiltCards() {
  const TILT_MAX = 18; // max degrees
  const SCALE = 1.04;

  document.querySelectorAll('.tilt-card').forEach(card => {
    // Add shine overlay if not present
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

      // Move shine to follow cursor
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

/* ---- CONTACT CARDS TILT ---- */
function initContactTilt() {
  document.querySelectorAll('.contact-card').forEach(el => {
    el.classList.add('tilt-card');
  });
  initTiltCards();
}

/* ================================================================
   SMOOTH SCROLL NAV LINKS
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
  initNavAuth();
  initParticles();
  renderRecent();
  renderCourses();
  initContactTilt();
  initScrollReveal();

  // Add reveal classes to about + contact cards
  document.querySelector('.about-card')?.classList.add('reveal');
  document.querySelectorAll('.contact-card').forEach((el, i) => {
    el.classList.add('reveal', `reveal-delay-${i+1}`);
  });
  initScrollReveal();
});
