/* ============================================
   Nilambari Travels - Shared Components & Utilities
   ============================================ */

// ---- Toast Notification System ----
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;

  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `
    <span style="font-size:1.2rem;font-weight:700;">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---- Render Navbar ----
function renderNavbar(activePage = '') {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
    <a href="index.html" class="navbar__brand">
      <div class="navbar__logo">N</div>
      <span class="navbar__title">Nilambari Travels</span>
    </a>
    <nav class="navbar__links" id="nav-links">
      <a href="index.html" ${activePage === 'home' ? 'style="color:var(--text-primary)"' : ''}>Home</a>
      <a href="results.html" ${activePage === 'results' ? 'style="color:var(--text-primary)"' : ''}>Routes</a>
      <a href="admin-login.html" ${activePage === 'admin' ? 'style="color:var(--text-primary)"' : ''}>Admin</a>
    </nav>
    <button class="hamburger-btn" id="hamburger-btn" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
  `;

  // Hamburger toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  hamburgerBtn.addEventListener('click', toggleDrawer);
}

// ---- Render Drawer ----
function renderDrawer() {
  const existing = document.getElementById('drawer-overlay');
  if (existing) return;

  const overlay = document.createElement('div');
  overlay.id = 'drawer-overlay';
  overlay.className = 'drawer-overlay';
  overlay.addEventListener('click', closeDrawer);

  const drawer = document.createElement('div');
  drawer.id = 'drawer';
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <div class="drawer__header">
      <span class="drawer__header-title">☰ Menu</span>
      <button class="drawer__close" id="drawer-close-btn" aria-label="Close menu">✕</button>
    </div>
    <nav class="drawer__nav">
      <a href="index.html" class="drawer__nav-item">
        <span class="icon">🏠</span> Home
      </a>
      <a href="results.html" class="drawer__nav-item">
        <span class="icon">🔍</span> Search Routes
      </a>
      <a href="#" class="drawer__nav-item" onclick="showToast('FAQ coming soon!','info'); return false;">
        <span class="icon">❓</span> FAQ
      </a>
      <a href="#" class="drawer__nav-item" onclick="showToast('Contact: +91 98765 43210','info'); return false;">
        <span class="icon">📞</span> Contact
      </a>
      <a href="admin-login.html" class="drawer__nav-item" style="margin-top:var(--space-lg); color:var(--accent-400);">
        <span class="icon">🔐</span> Admin Login
      </a>
    </nav>
    <div class="drawer__footer">
      © 2026 Nilambari Travels. All rights reserved.
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  document.getElementById('drawer-close-btn').addEventListener('click', closeDrawer);
}

function toggleDrawer() {
  const overlay = document.getElementById('drawer-overlay');
  const drawer = document.getElementById('drawer');
  const hamburger = document.getElementById('hamburger-btn');

  if (overlay && drawer) {
    overlay.classList.toggle('active');
    drawer.classList.toggle('active');
    hamburger.classList.toggle('active');
  }
}

function closeDrawer() {
  const overlay = document.getElementById('drawer-overlay');
  const drawer = document.getElementById('drawer');
  const hamburger = document.getElementById('hamburger-btn');

  if (overlay) overlay.classList.remove('active');
  if (drawer) drawer.classList.remove('active');
  if (hamburger) hamburger.classList.remove('active');
}

// ---- Render Background Orbs ----
function renderBgOrbs() {
  if (document.querySelector('.bg-orbs')) return;
  const orbs = document.createElement('div');
  orbs.className = 'bg-orbs';
  orbs.innerHTML = '<div class="orb"></div><div class="orb"></div><div class="orb"></div>';
  document.body.prepend(orbs);
}

// ---- Render Footer ----
function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer__content">
        <div class="footer__text">
          © 2026 Nilambari Travels. Crafted with ❤️ for seamless travel.
        </div>
        <div class="footer__links">
          <a href="#" onclick="showToast('Privacy Policy coming soon','info'); return false;">Privacy</a>
          <a href="#" onclick="showToast('Terms & Conditions coming soon','info'); return false;">Terms</a>
          <a href="#" onclick="showToast('Contact: +91 98765 43210','info'); return false;">Contact</a>
        </div>
      </div>
    </div>
  `;
}

// ---- Render Stepper ----
function renderStepper(currentStep) {
  const steps = [
    { label: 'Search', num: 1 },
    { label: 'Results', num: 2 },
    { label: 'Seats', num: 3 },
    { label: 'Booking', num: 4 },
    { label: 'Payment', num: 5 }
  ];

  let html = '<div class="stepper">';
  steps.forEach((step, i) => {
    let cls = '';
    if (step.num < currentStep) cls = 'stepper__step--completed';
    else if (step.num === currentStep) cls = 'stepper__step--active';

    html += `
      <div class="stepper__step ${cls}">
        <div class="stepper__circle">${step.num < currentStep ? '✓' : step.num}</div>
        <span class="stepper__label">${step.label}</span>
      </div>
    `;
    if (i < steps.length - 1) {
      html += `<div class="stepper__line ${step.num < currentStep ? 'stepper__line--completed' : ''}"></div>`;
    }
  });
  html += '</div>';
  return html;
}

// ---- Render Breadcrumb ----
function renderBreadcrumb(crumbs) {
  let html = '<div class="breadcrumb">';
  crumbs.forEach((crumb, i) => {
    if (i === crumbs.length - 1) {
      html += `<span class="breadcrumb__current">${crumb.label}</span>`;
    } else {
      html += `<a href="${crumb.href}">${crumb.label}</a>`;
      html += `<span class="breadcrumb__separator">›</span>`;
    }
  });
  html += '</div>';
  return html;
}

// ---- Initialize Common Elements ----
function initPageCommon(activePage) {
  renderBgOrbs();
  renderNavbar(activePage);
  renderDrawer();
  renderFooter();

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  });
}

// ---- Date Helper ----
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-IN', options);
}
