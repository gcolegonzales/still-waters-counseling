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
  var header = document.getElementById('siteHeader');
  var mainEl = document.getElementById('main');
  var footerEl = document.querySelector('.site-footer');
  var panel = menu ? menu.querySelector('.mobile-menu-panel') : null;

  function focusableInPanel() {
    if (!panel) return [];
    return Array.prototype.slice.call(
      panel.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
    );
  }

  // hide the rest of the page from AT + tab order while the drawer is open
  function setBackgroundInert(on) {
    [mainEl, footerEl, header].forEach(function (el) {
      if (!el) return;
      if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
    // the toggle lives inside the header; keep it usable so it can still close
    if (on && toggle && header && header.contains(toggle)) {
      toggle.removeAttribute('inert');
    }
  }

  function openMenu() {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('show'); });
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    // move focus into the drawer (first link)
    var first = panel ? panel.querySelector('a[href], button') : null;
    if (first) { try { first.focus(); } catch (e) {} }
  }
  function closeMenu(returnFocus) {
    var wasOpen = menu.classList.contains('open');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    scrim.classList.remove('show');
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    setBackgroundInert(false);
    setTimeout(function () { scrim.hidden = true; }, 400);
    // return focus to the toggle (unless a nav link is taking us elsewhere)
    if (wasOpen && returnFocus !== false && toggle) { try { toggle.focus(); } catch (e) {} }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      menu.classList.contains('open') ? closeMenu() : openMenu();
    });
  }
  if (scrim) scrim.addEventListener('click', function () { closeMenu(); });
  if (menu) {
    menu.querySelectorAll('a').forEach(function (a) {
      // nav-link tap moves the page; don't yank focus back to the toggle
      a.addEventListener('click', function () { closeMenu(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!menu || !menu.classList.contains('open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    // focus trap: keep Tab within the drawer panel
    if (e.key === 'Tab') {
      var f = focusableInPanel();
      if (!f.length) { e.preventDefault(); return; }
      var firstF = f[0], lastF = f[f.length - 1];
      var active = document.activeElement;
      if (e.shiftKey) {
        if (active === firstF || !panel.contains(active)) { e.preventDefault(); lastF.focus(); }
      } else {
        if (active === lastF || !panel.contains(active)) { e.preventDefault(); firstF.focus(); }
      }
    }
  });

  // reset drawer + toggle state when crossing the desktop breakpoint
  var desktopMq = window.matchMedia('(min-width:961px)');
  function handleBreakpoint(e) {
    if (e.matches && menu && menu.classList.contains('open')) closeMenu(false);
  }
  if (desktopMq.addEventListener) desktopMq.addEventListener('change', handleBreakpoint);
  else if (desktopMq.addListener) desktopMq.addListener(handleBreakpoint);

  /* ---------- skip link: move focus to <main> ---------- */
  var skipLink = document.querySelector('.skip-link');
  if (skipLink && mainEl) {
    skipLink.addEventListener('click', function () {
      mainEl.setAttribute('tabindex', '-1');
      // focus after the browser processes the hash jump
      requestAnimationFrame(function () {
        try { mainEl.focus(); } catch (e) {}
      });
    });
    mainEl.addEventListener('blur', function () { mainEl.removeAttribute('tabindex'); });
  }

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
