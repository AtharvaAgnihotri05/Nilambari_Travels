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

  const icons = { 
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="20 6 9 17 4 12"/></svg>', 
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', 
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>' 
  };
  toast.innerHTML = `
    <span style="display:flex; align-items:center;">${icons[type] || icons.info}</span>
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
    <div class="navbar__actions" style="display: flex; align-items: center; gap: var(--space-md);">
      <label class="theme-switch" for="theme-toggle" aria-label="Toggle theme">
        <input type="checkbox" id="theme-toggle">
        <div class="theme-switch__slider"></div>
      </label>
      <button class="hamburger-btn" id="hamburger-btn" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  `;

  // Hamburger toggle
  const hamburgerBtn = document.getElementById('hamburger-btn');
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleDrawer);

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.checked = document.body.getAttribute('data-theme') === 'light';
    themeToggle.addEventListener('change', toggleTheme);
  }
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
        <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span> Home
      </a>
      <a href="results.html" class="drawer__nav-item">
        <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/></svg></span> Search Routes
      </a>
      <a href="#" class="drawer__nav-item" onclick="showToast('FAQ coming soon!','info'); return false;">
        <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span> FAQ
      </a>
      <a href="#" class="drawer__nav-item" onclick="showToast('Contact: +91 98765 43210','info'); return false;">
        <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span> Contact
      </a>
      <a href="admin-login.html" class="drawer__nav-item" style="margin-top:var(--space-lg); color:var(--accent-400);">
        <span class="icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span> Admin Login
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
  // Glowing orbs removed per request
}

// ---- Render Footer ----
function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer__content">
        <div class="footer__text">
          © 2026 Nilambari Travels. Crafted with <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true" style="color:var(--danger-500); vertical-align:middle; margin-inline: 4px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> for seamless travel.
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
  initTheme();
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

// ---- Theme System ----
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.setAttribute('data-theme', 'light');
  }
}

function toggleTheme(e) {
  if (e.target.checked) {
    document.body.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('theme', 'dark');
  }
}
