// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyADIQLu7KTxmtKwqV9f-XfhCZ9ZrxqdYY8",
  authDomain: "class-now-hsc.firebaseapp.com",
  projectId: "class-now-hsc",
  storageBucket: "class-now-hsc.firebasestorage.app",
  messagingSenderId: "729809726831",
  appId: "1:729809726831:web:e60fec1c2d54df66010c9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// ============================================================
//  APP.JS — Firebase Auth Backend v6
//  Real cross-device login + last device wins
// ============================================================

// ============================================================
//  FIREBASE CONFIG — replace with YOUR project values
//  (instructions at bottom of this file)
// ============================================================
const FIREBASE_CONFIG = {
  apiKey:            "REPLACE_API_KEY",
  authDomain:        "REPLACE_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://REPLACE_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "REPLACE_PROJECT_ID",
  storageBucket:     "REPLACE_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_SENDER_ID",
  appId:             "REPLACE_APP_ID"
};

// ============================================================
//  FIREBASE SDK (loaded via CDN in HTML — no npm needed)
// ============================================================
let db; // Realtime Database reference

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded — running in localStorage mode');
    db = null; return false;
  }
  // Guard: if config still has placeholder values, skip Firebase entirely.
  // firebase.initializeApp() does NOT throw with fake values — it silently
  // sets db to a broken object that hangs on every .once() call.
  const cfg = FIREBASE_CONFIG;
  if (!cfg.apiKey || cfg.apiKey.startsWith('REPLACE_') ||
      !cfg.databaseURL || cfg.databaseURL.includes('REPLACE_')) {
    console.info('Firebase config not set — using localStorage auth (single-device mode)');
    db = null; return false;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    db = firebase.database();
    console.info('Firebase connected ✓');
    return true;
  } catch(e) {
    console.warn('Firebase init error — falling back to localStorage:', e.message);
    db = null; return false;
  }
}

// ============================================================
//  SIMPLE HASH (SHA-256 via SubtleCrypto — built into browser)
// ============================================================
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function genToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ============================================================
//  AUTH — all data stored in Firebase Realtime DB
//  Structure:
//    /users/{userId}/name, email, passwordHash, deviceToken
//    /emailIndex/{encodedEmail} → userId   (for lookup by email)
// ============================================================
const Auth = {
  // encode email to safe Firebase key (replace . with ,)
  encodeEmail(email) { return email.toLowerCase().replace(/\./g, ','); },

  getSession()   { return JSON.parse(localStorage.getItem('cn_session') || 'null'); },
  saveSession(s) { localStorage.setItem('cn_session', JSON.stringify(s)); },
  clearSession() { localStorage.removeItem('cn_session'); },

  async register(name, email, password) {
    // ── Firebase path ──
    if (db) {
      const eKey = this.encodeEmail(email);
      const snap = await db.ref('emailIndex/' + eKey).once('value');
      if (snap.exists()) return { ok: false, msg: 'Email already registered.' };
      const passwordHash = await hashPassword(password);
      const deviceToken  = genToken();
      const userId       = 'u_' + Date.now();
      await db.ref('users/' + userId).set({ name, email: email.toLowerCase(), passwordHash, deviceToken, joinedAt: new Date().toISOString() });
      await db.ref('emailIndex/' + eKey).set(userId);
      this.saveSession({ userId, name, email: email.toLowerCase(), deviceToken });
      return { ok: true };
    }
    // ── Local fallback (no Firebase config yet) ──
    const users = JSON.parse(localStorage.getItem('cn_users') || '{}');
    const key   = email.toLowerCase();
    if (users[key]) return { ok: false, msg: 'Email already registered.' };
    const passwordHash = await hashPassword(password);
    const userId = 'u_' + Date.now();
    users[key] = { userId, name, email: key, passwordHash };
    localStorage.setItem('cn_users', JSON.stringify(users));
    this.saveSession({ userId, name, email: key, deviceToken: 'local' });
    return { ok: true };
  },

  async login(email, password) {
    // ── Firebase path ──
    if (db) {
      const eKey = this.encodeEmail(email);
      const idSnap = await db.ref('emailIndex/' + eKey).once('value');
      if (!idSnap.exists()) return { ok: false, msg: 'Incorrect email or password.' };
      const userId   = idSnap.val();
      const userSnap = await db.ref('users/' + userId).once('value');
      if (!userSnap.exists()) return { ok: false, msg: 'Incorrect email or password.' };
      const user = userSnap.val();
      const passwordHash = await hashPassword(password);
      if (user.passwordHash !== passwordHash) return { ok: false, msg: 'Incorrect email or password.' };
      const deviceToken = genToken();
      await db.ref('users/' + userId + '/deviceToken').set(deviceToken);
      this.saveSession({ userId, name: user.name, email: user.email, deviceToken });
      return { ok: true, user: { name: user.name, email: user.email } };
    }
    // ── Local fallback (no Firebase config yet) ──
    const users = JSON.parse(localStorage.getItem('cn_users') || '{}');
    const key   = email.toLowerCase();
    const user  = users[key];
    if (!user) return { ok: false, msg: 'Incorrect email or password.' };
    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) return { ok: false, msg: 'Incorrect email or password.' };
    this.saveSession({ userId: user.userId, name: user.name, email: key, deviceToken: 'local' });
    return { ok: true, user: { name: user.name, email: key } };
  },

  async logout() {
    const session = this.getSession();
    if (session && db) {
      // Invalidate token in DB
      await db.ref('users/' + session.userId + '/deviceToken').set(null);
    }
    this.clearSession();
  },

  async isLoggedIn() {
    const session = this.getSession();
    if (!session || !db) return !!session; // fallback if DB not ready
    try {
      const snap = await db.ref('users/' + session.userId + '/deviceToken').once('value');
      if (!snap.exists() || snap.val() !== session.deviceToken) {
        this.clearSession();
        return false;
      }
      return true;
    } catch(e) {
      // Offline fallback — trust local session
      return true;
    }
  },

  currentUser() { return this.getSession(); }
};

// ============================================================
//  LOGOUT FUNCTION
// ============================================================
async function logout() {
  await Auth.logout();
  showToast('Logged out successfully.', 'success');
  setTimeout(() => location.href = 'index.html', 900);
}

// ============================================================
//  SESSION VALIDITY CHECK (on classes.html)
// ============================================================
async function checkSessionValidity() {
  const session = Auth.getSession();
  if (!session || !db) return;
  try {
    const snap = await db.ref('users/' + session.userId + '/deviceToken').once('value');
    if (!snap.exists() || snap.val() !== session.deviceToken) {
      Auth.clearSession();
      if (window.location.pathname.includes('classes.html')) {
        showToast('Logged in from another device. Please login again.', 'error');
        setTimeout(() => window.location.href = 'login.html', 1800);
      }
    }
  } catch(e) { /* offline — skip */ }
}

// ============================================================
//  NAV AUTH STATE
// ============================================================
function initNavAuth() {
  const session  = Auth.getSession(); // sync check (fast)
  const loggedIn = !!session;
  const firstName = loggedIn ? session.name.split(' ')[0] : '';

  const navAuth  = document.getElementById('navAuth');
  const navUser  = document.getElementById('navUser');
  const userNameEl = document.getElementById('userName');
  const mobAuth  = document.getElementById('mobAuthLinks');
  const mobUser  = document.getElementById('mobUserLinks');
  const mobName  = document.getElementById('mobUserName');

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

// ============================================================
//  HAMBURGER
// ============================================================
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', open);
    btn.innerHTML = open ? '&#9776;' : '&#10005;';
  });
  document.addEventListener('click', e => {
    if (!menu.classList.contains('hidden') && !menu.contains(e.target) && e.target !== btn) {
      menu.classList.add('hidden'); btn.innerHTML = '&#9776;';
    }
  });
  window.addEventListener('scroll', () => {
    if (!menu.classList.contains('hidden')) { menu.classList.add('hidden'); btn.innerHTML = '&#9776;'; }
  }, { passive: true });
}

function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.add('hidden');
  const btn = document.getElementById('hamburger');
  if (btn) btn.innerHTML = '&#9776;';
}

// ============================================================
//  NAVBAR SCROLL
// ============================================================
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

// ============================================================
//  PARTICLES
// ============================================================
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts, mouse = { x: -9999, y: -9999 };
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; buildPts(); };
  const buildPts = () => {
    const n = Math.min(60, Math.floor(W * H / 14000));
    pts = Array.from({ length: n }, () => ({ x: Math.random()*W, y: Math.random()*H, z: Math.random(), vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, r: Math.random()*1.5+.4 }));
  };
  document.addEventListener('mousemove', e => { mouse.x=e.clientX; mouse.y=e.clientY; }, { passive:true });
  document.addEventListener('touchmove', e => { mouse.x=e.touches[0].clientX; mouse.y=e.touches[0].clientY; }, { passive:true });
  const draw = () => {
    ctx.clearRect(0,0,W,H);
    pts.forEach((p,i) => {
      const dx=mouse.x-p.x, dy=mouse.y-p.y, dist=Math.sqrt(dx*dx+dy*dy);
      if(dist<160){p.vx+=dx/dist*.012;p.vy+=dy/dist*.012;}
      p.vx*=.98;p.vy*=.98;p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*(.5+p.z*.5),0,Math.PI*2);
      ctx.fillStyle=`rgba(0,198,255,${.08+p.z*.22})`;ctx.fill();
      for(let j=i+1;j<pts.length;j++){
        const q=pts[j],d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<120){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(0,198,255,${(1-d/120)*.06})`;ctx.lineWidth=.5;ctx.stroke();}
      }
    });
    requestAnimationFrame(draw);
  };
  resize(); draw();
  window.addEventListener('resize', resize, { passive:true });
}

// ============================================================
//  3D TILT
// ============================================================
function initTiltCards() {
  if (window.matchMedia('(hover: none)').matches) return;
  const TILT_MAX=16, SCALE=1.03;
  document.querySelectorAll('.tilt-card').forEach(card => {
    if (!card.querySelector('.card-shine')) {
      const s=document.createElement('div'); s.className='card-shine';
      card.style.position='relative'; card.appendChild(s);
    }
    card.addEventListener('mousemove', e => {
      const r=card.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)/(r.width/2), dy=(e.clientY-r.top-r.height/2)/(r.height/2);
      card.style.transform=`perspective(900px) rotateX(${-dy*TILT_MAX}deg) rotateY(${dx*TILT_MAX}deg) scale(${SCALE})`;
      card.style.transition='transform 0.08s ease';
      const shine=card.querySelector('.card-shine');
      if(shine){shine.style.background=`radial-gradient(circle at ${((e.clientX-r.left)/r.width)*100}% ${((e.clientY-r.top)/r.height)*100}%, rgba(255,255,255,0.1), transparent 60%)`;shine.style.opacity='1';}
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform='perspective(900px) rotateX(0) rotateY(0) scale(1)';
      card.style.transition='transform 0.5s cubic-bezier(0.23,1,0.32,1)';
      const shine=card.querySelector('.card-shine'); if(shine)shine.style.opacity='0';
    });
  });
}

// ============================================================
//  SCROLL REVEAL
// ============================================================
function initScrollReveal() {
  const els=document.querySelectorAll('.reveal'); if(!els.length)return;
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:.1});
  els.forEach(el=>io.observe(el));
}

// ============================================================
//  RENDER HOME
// ============================================================
function renderRecent() {
  const grid=document.getElementById('recentGrid'); if(!grid||!window.RECENT_CLASSES)return;
  grid.innerHTML=RECENT_CLASSES.map((c,i)=>`
    <div class="recent-card tilt-card reveal reveal-delay-${(i%3)+1}" onclick="openClass(${c.id})">
      <div class="recent-card-inner">
        <div class="recent-thumb">
          <img src="${c.thumb}" alt="${c.title}" loading="lazy" onerror="this.parentNode.style.background='var(--surface2)'"/>
          <div class="thumb-play"><span>▶</span></div>
        </div>
        <div class="recent-body">
          ${c.isNew?'<span class="recent-badge new-badge">🆕 New</span>':`<span class="recent-badge">${c.subject}</span>`}
          <div class="recent-title">${c.title}</div>
          <div class="recent-meta">👨‍🏫 ${c.lecturer} &nbsp;·&nbsp; 📅 ${fmtDate(c.date)}</div>
        </div>
      </div>
    </div>`).join('');
  initTiltCards(); initScrollReveal();
}

function openClass(id) {
  if (!Auth.getSession()) { showToast('Please login to watch classes.','error'); setTimeout(()=>location.href='login.html',1100); return; }
  const cls=RECENT_CLASSES.find(c=>c.id==id);
  if(cls)localStorage.setItem('cn_play_video',JSON.stringify({videoId:cls.videoId,title:cls.title}));
  location.href='classes.html';
}

function renderCourses() {
  const grid=document.getElementById('coursesGrid'); if(!grid||!window.COURSES)return;
  grid.innerHTML=COURSES.map((c,i)=>{
    // FRB special image card
    if(c.isFRB) return `
      <button
        class="course-card frb-card tilt-card reveal reveal-delay-1"
        onclick="handleFRBClick(event)"
        aria-label="Free FRB Classes for HSC — Click to watch free classes"
        role="button"
        tabindex="0"
        style="cursor:pointer;text-align:left;width:100%;border:none;background:none;padding:0;"
      >
        <div class="frb-img-wrap">
          <img src="${c.image}" alt="Free FRB Classes for HSC — 100% free course banner"
            loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <div class="frb-fallback" style="display:none;align-items:center;justify-content:center;height:200px;background:linear-gradient(135deg,#1a1200,#2d1f00);font-size:3rem;" aria-hidden="true">🎓</div>
          <div class="frb-overlay frb-overlay-visible" aria-hidden="true">
            <span class="frb-badge">🎓 100% FREE</span>
            <span class="frb-cta">▶ Watch Free Classes →</span>
          </div>
        </div>
      </button>`;
    // Normal card
    return `
    <div class="course-card tilt-card reveal reveal-delay-${(i%3)+1}">
      <div class="course-header">
        <div class="course-icon-wrap" style="background:${c.color}18;box-shadow:0 0 20px ${c.color}30;">
          <span style="color:${c.color};filter:drop-shadow(0 0 8px ${c.color}88);">${c.icon}</span>
        </div>
        <div class="course-title">${c.title}</div>
        <div class="course-desc">${c.description}</div>
        <div class="course-meta"><span class="meta-item">📹 ${c.lectures} Lectures</span><span class="meta-item">⏱ ${c.duration}</span></div>
      </div>
      <div class="course-footer">
        <div class="price-wrap"><span class="price-orig">৳${c.originalPrice}</span><span class="price-now">৳${c.price}</span><span class="price-currency">BDT</span></div>
        <button class="btn-enroll" style="background:linear-gradient(135deg,${c.color},${c.colorDark});box-shadow:0 6px 20px ${c.color}50;" onclick="enrollCourse('${c.id}')">Enroll Now</button>
      </div>
    </div>`;
  }).join('');
  initTiltCards(); initScrollReveal();
}


function goToSubject(courseId) {
  if (!Auth.getSession()) {
    showToast('Please login to watch classes.', 'error');
    setTimeout(() => location.href = 'login.html', 1100); return;
  }
  localStorage.setItem('cn_active_course', courseId);
  location.href = 'classes.html';
}
function goToClasses() {
  if (!Auth.getSession()) {
    showToast('Please login to watch classes.', 'error');
    setTimeout(() => location.href = 'login.html', 1100); return;
  }
  location.href = 'classes.html';
}

// FRB card click — keyboard + mouse accessible
function handleFRBClick(e) {
  // Allow keyboard activation (Enter/Space)
  if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  const session = Auth.getSession();
  if (!session) {
    showToast('Please login to watch free classes.', 'error');
    setTimeout(() => location.href = 'login.html', 1100); return;
  }
  location.href = 'classes.html';
}

function enrollCourse(id) {
  if (!Auth.getSession()) { showToast('Please login to enroll.','error'); setTimeout(()=>location.href='signup.html',1000); return; }
  localStorage.setItem('cn_active_course',id); location.href='classes.html';
}

function initContactTilt() { document.querySelectorAll('.contact-card').forEach(el=>el.classList.add('tilt-card')); initTiltCards(); }

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}});
});

// ============================================================
//  TOAST
// ============================================================
function showToast(msg,type='info') {
  let toast=document.getElementById('globalToast');
  if(!toast){toast=document.createElement('div');toast.id='globalToast';toast.className='toast';document.body.appendChild(toast);}
  toast.innerHTML=`<span>${{success:'✅',error:'❌',info:'ℹ️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
  toast.className=`toast ${type}`;
  requestAnimationFrame(()=>requestAnimationFrame(()=>toast.classList.add('show')));
  clearTimeout(toast._timer); toast._timer=setTimeout(()=>toast.classList.remove('show'),3500);
}

function fmtDate(d) { return new Date(d).toLocaleDateString('en-BD',{day:'numeric',month:'short',year:'numeric'}); }

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Render UI immediately — never blocked by Firebase
  initNavAuth();
  initHamburger();
  initParticles();
  renderRecent();
  renderCourses();
  initContactTilt();
  initScrollReveal();
  document.querySelector('.about-card')?.classList.add('reveal');
  document.querySelectorAll('.contact-card').forEach((el,i)=>el.classList.add('reveal',`reveal-delay-${i+1}`));
  initScrollReveal();
  // Firebase init async — won't block UI if config missing/invalid
  initFirebase();
  checkSessionValidity();
});
