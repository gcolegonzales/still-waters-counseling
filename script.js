/* ============================================================
   Still Waters Counseling & Therapy — interactions
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- current year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- header shrink on scroll ---------- */
  var header = document.getElementById('siteHeader');
  var lastKnown = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 20);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    lastKnown = window.scrollY;
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('mobileMenu');
  var scrim = document.getElementById('menuScrim');

  function openMenu() {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('show'); });
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    scrim.classList.remove('show');
    document.body.style.overflow = '';
    setTimeout(function () { scrim.hidden = true; }, 400);
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      menu.classList.contains('open') ? closeMenu() : openMenu();
    });
  }
  if (scrim) scrim.addEventListener('click', closeMenu);
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu && menu.classList.contains('open')) closeMenu();
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.primary-nav a'));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- graceful form feedback ---------- */
  var form = document.getElementById('inquiryForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var checked = form.querySelector('input[name="Counseling For"]:checked');
      var body =
        'Name: ' + val('f-name') + '\n' +
        'Email: ' + val('f-email') + '\n' +
        'Phone: ' + val('f-phone') + '\n' +
        'Counseling for: ' + (checked ? checked.value : '') + '\n\n' +
        'What brings you in:\n' + val('f-brings') + '\n\n' +
        'Preferred days & times: ' + val('f-times') + '\n';
      var href = 'mailto:Lglcsw@outlook.com'
        + '?subject=' + encodeURIComponent('Appointment request — ' + (val('f-name') || 'New client'))
        + '&body=' + encodeURIComponent(body);
      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.textContent = 'Opening your email…';
        setTimeout(function () { btn.textContent = 'Send my request'; }, 4000);
      }
      window.location.href = href;
    });
  }
})();
