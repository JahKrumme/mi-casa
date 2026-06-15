(function () {
  'use strict';

  // Inject lightbox HTML
  document.body.insertAdjacentHTML('beforeend', `
    <div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Photo viewer">
      <button class="lightbox-close" id="lightbox-close" aria-label="Close photo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <button class="lightbox-prev" id="lightbox-prev" aria-label="Previous photo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="lightbox-next" id="lightbox-next" aria-label="Next photo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
      <div class="lightbox-stage" id="lightbox-stage">
        <img id="lightbox-img" src="" alt="" class="lightbox-img" />
      </div>
      <p class="lightbox-counter" id="lightbox-counter" aria-live="polite"></p>
    </div>
  `);

  var lightbox  = document.getElementById('lightbox');
  var lbImg     = document.getElementById('lightbox-img');
  var counter   = document.getElementById('lightbox-counter');
  var prevBtn   = document.getElementById('lightbox-prev');
  var nextBtn   = document.getElementById('lightbox-next');
  var lastFocus = null;
  var cur       = 0;
  var imgs      = [];

  // Collect only currently-visible gallery images (respects filter state)
  function getVisible() {
    return Array.from(document.querySelectorAll('.gallery-item')).filter(function (item) {
      return item.style.display !== 'none';
    }).map(function (item) {
      return item.querySelector('img.gallery-img');
    }).filter(Boolean);
  }

  function show() {
    var src = imgs[cur].src;
    var alt = imgs[cur].alt;
    lbImg.style.opacity = '0';
    lbImg.onload = function () { lbImg.style.opacity = '1'; };
    lbImg.src = src;
    lbImg.alt = alt;
    if (lbImg.complete) lbImg.style.opacity = '1';
    counter.textContent = (cur + 1) + ' – ' + imgs.length;
    prevBtn.style.visibility = imgs.length > 1 ? '' : 'hidden';
    nextBtn.style.visibility = imgs.length > 1 ? '' : 'hidden';
  }

  function open(index) {
    imgs = getVisible();
    cur  = index;
    lastFocus = document.activeElement;
    show();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('lightbox-close').focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  function prev() { cur = (cur - 1 + imgs.length) % imgs.length; show(); }
  function next() { cur = (cur + 1) % imgs.length; show(); }

  // Open on gallery item click
  document.addEventListener('click', function (e) {
    var imgEl = e.target.closest('.gallery-item img.gallery-img');
    if (!imgEl) return;
    var visible = getVisible();
    var index   = visible.indexOf(imgEl);
    if (index !== -1) open(index);
  });

  // Controls
  document.getElementById('lightbox-close').addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Click backdrop to close
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === document.getElementById('lightbox-stage')) close();
  });

  // Keyboard
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  // Touch swipe
  var touchX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  }, { passive: true });
}());
