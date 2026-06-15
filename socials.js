(function () {
  'use strict';

  // ─────────────────────────────────────────────
  // Central social media config
  // To add a new platform, push one entry here.
  // Both the home-page section and Casa Companion read from this array.
  // ─────────────────────────────────────────────
  window.MI_CASA_SOCIALS = [
    {
      name: 'Facebook',
      url:  'https://www.facebook.com/p/Mi-Casa-Care-Homes-61566464525639/',
      icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>'
    }
  ];

  // Render icon links into every .social-icons-mount element on the page
  document.addEventListener('DOMContentLoaded', function () {
    var mounts = document.querySelectorAll('.social-icons-mount');
    mounts.forEach(function (mount) {
      window.MI_CASA_SOCIALS.forEach(function (s) {
        var a = document.createElement('a');
        a.href      = s.url;
        a.target    = '_blank';
        a.rel       = 'noopener noreferrer';
        a.className = 'social-btn';
        a.setAttribute('aria-label', 'Follow Mi Casa Care Homes on ' + s.name);
        a.innerHTML = s.icon + '<span>' + s.name + '</span>';
        mount.appendChild(a);
      });
    });
  });
}());
