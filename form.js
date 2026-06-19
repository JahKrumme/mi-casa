document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('visit-form');
  if (!form) return;

  const rules = [
    { id: 'first-name',    check: v => v.trim().length > 0,                      errId: 'first-name-error' },
    { id: 'last-name',     check: v => v.trim().length > 0,                      errId: 'last-name-error' },
    { id: 'phone',         check: v => /^[\d\s\-()+]{7,}$/.test(v.trim()),       errId: 'phone-error' },
    { id: 'email',         check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()), errId: 'email-error' },
    { id: 'relationship',  check: v => v !== '',                                  errId: 'relationship-error' },
    { id: 'house',         check: v => v !== '',                                  errId: 'house-error' },
    { id: 'visit-date',    check: v => v !== '',                                  errId: 'visit-date-error' },
    { id: 'visit-time',    check: v => v !== '',                                  errId: 'visit-time-error' },
  ];

  function validateField(rule) {
    const el = document.getElementById(rule.id);
    const err = document.getElementById(rule.errId);
    const valid = rule.check(el.value);
    el.classList.toggle('error', !valid);
    err.classList.toggle('visible', !valid);
    if (!valid) el.setAttribute('aria-describedby', rule.errId);
    else el.removeAttribute('aria-describedby');
    return valid;
  }

  // Live validation on blur
  rules.forEach(rule => {
    const el = document.getElementById(rule.id);
    if (el) el.addEventListener('blur', () => validateField(rule));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const allValid = rules.map(validateField).every(Boolean);
    if (!allValid) {
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.focus();
      return;
    }
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    })
    .then(function (res) {
      if (res.ok) {
        window.location.href = '/success.html';
      } else {
        throw new Error('Server error');
      }
    })
    .catch(function () {
      btn.disabled = false;
      btn.textContent = 'Request a Visit';
      alert('Something went wrong. Please try again or contact us directly.');
    });
  });
});
