function closeAllDropdowns() {
  document.querySelectorAll('.nav-item-has-dropdown').forEach(function (item) {
    item.classList.remove('dropdown-open');
    const toggle = item.querySelector('.nav-dropdown-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  });
}

function toggleNav(btn) {
  const links = document.getElementById('nav-links');
  const open = links.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  if (!open) closeAllDropdowns();
}

function toggleDropdown(btn) {
  const item = btn.closest('.nav-item-has-dropdown');
  const open = item.classList.toggle('dropdown-open');
  btn.setAttribute('aria-expanded', open);
}

// Close nav and dropdowns on outside click
document.addEventListener('click', function (e) {
  const nav = document.querySelector('.site-nav');
  if (!nav.contains(e.target)) {
    document.getElementById('nav-links').classList.remove('open');
    const btn = document.querySelector('.nav-toggle');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    closeAllDropdowns();
  }
});

// Shrink nav on scroll with hysteresis to prevent flicker
(function () {
  const nav = document.querySelector('.site-nav');
  let scrolled = false;
  function onScroll() {
    if (!scrolled && window.scrollY > 60) {
      scrolled = true;
      nav.classList.add('scrolled');
    } else if (scrolled && window.scrollY < 20) {
      scrolled = false;
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}());

// Set min date on visit date field to today
document.addEventListener('DOMContentLoaded', function () {
  const dateField = document.getElementById('visit-date');
  if (dateField) {
    const today = new Date().toISOString().split('T')[0];
    dateField.setAttribute('min', today);
  }
});
