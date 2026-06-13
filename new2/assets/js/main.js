/* ============================================================
   LAKSHMI SREEDHAR — Cupertino theme
   Apple-style motion: reveals · parallax · pinned horizontal scroll
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Bar Council Disclaimer Modal ── */
  var disclaimerOverlay = document.getElementById('disclaimer-overlay');
  var disclaimerBtn = document.getElementById('disclaimer-agree');
  var disclaimerContent = document.getElementById('disclaimer-content');

  if (disclaimerBtn && disclaimerOverlay) {
    document.body.style.overflow = 'hidden';

    if (disclaimerContent && !reduceMotion) {
      var autoScrolling = true;
      disclaimerContent.addEventListener('touchstart', function () { autoScrolling = false; }, { passive: true });
      disclaimerContent.addEventListener('mousedown', function () { autoScrolling = false; });
      disclaimerContent.addEventListener('wheel', function () { autoScrolling = false; }, { passive: true });

      setTimeout(function () {
        var scrollPos = disclaimerContent.scrollTop;
        (function step() {
          if (!autoScrolling) return;
          scrollPos += 0.5;
          disclaimerContent.scrollTop = Math.floor(scrollPos);
          var atBottom = disclaimerContent.scrollTop + disclaimerContent.clientHeight >= disclaimerContent.scrollHeight - 2;
          if (atBottom) return;
          requestAnimationFrame(step);
        })();
      }, 2000);
    }

    disclaimerBtn.addEventListener('click', function () {
      disclaimerOverlay.classList.add('is-hidden');
      document.body.style.overflow = '';
    });
  }

  /* ── Frosted nav on scroll ── */
  var navbar = document.getElementById('navbar');
  function navScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }

  /* ── Mobile menu ── */
  var navToggle = document.getElementById('nav-toggle');
  var navOverlay = document.getElementById('nav-overlay');
  var navOverlayLinks = navOverlay ? navOverlay.querySelectorAll('a') : [];

  function closeMenu() {
    if (!navToggle) return;
    navToggle.classList.remove('is-active');
    navOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = navOverlay.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', open);
      document.body.style.overflow = open ? 'hidden' : '';
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  navOverlayLinks.forEach(function (link) { link.addEventListener('click', closeMenu); });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var navH = navbar ? navbar.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ── Hero query form → WhatsApp ── */
  var queryForm = document.getElementById('query-form');
  var queryInput = document.getElementById('query-input');
  var WHATSAPP_NUMBER = '918129948577';

  if (queryForm && queryInput) {
    queryForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = queryInput.value.trim();
      if (!text) { queryInput.focus(); return; }
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
      queryInput.value = '';
      queryForm.classList.add('is-sent');
      setTimeout(function () { queryForm.classList.remove('is-sent'); }, 6000);
    });
  }
  // "Ask your question" hero link → focus the textarea
  var askLink = document.getElementById('ask-link');
  if (askLink && queryInput) {
    askLink.addEventListener('click', function () { setTimeout(function () { queryInput.focus(); }, 200); });
  }

  /* ── Reveal on scroll (fade + scale + blur) ── */
  var reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revObserver.observe(el); });
  }

  /* ── Floating WhatsApp: hide over the contact footer ── */
  var whatsappFloat = document.querySelector('.whatsapp-float');
  var contactEl = document.getElementById('contact');
  if (whatsappFloat && contactEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      whatsappFloat.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { rootMargin: '0px 0px -20% 0px' }).observe(contactEl);
  }

  /* ========================================================
     SCROLL-LINKED MOTION (single rAF loop)
     - parallax on [data-parallax]
     - pinned horizontal lineup
     ======================================================== */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));

  // Pinned horizontal scroll setup
  var lineup = document.querySelector('.lineup');
  var pin = lineup ? lineup.querySelector('.lineup__pin') : null;
  var track = document.getElementById('lineup-track');
  var bar = document.getElementById('lineup-bar');
  var pinEnabled = false;
  var maxX = 0;

  function setupPin() {
    if (!lineup || !pin || !track) return;
    // disable the pin effect on small screens / reduced motion → static grid
    if (window.innerWidth < 768 || reduceMotion) {
      lineup.classList.add('lineup--static');
      lineup.style.height = '';
      pin.style.position = '';
      pin.style.top = '';
      track.style.transform = '';
      pinEnabled = false;
      return;
    }
    lineup.classList.remove('lineup--static');
    track.style.transform = '';                 // measure untransformed width
    maxX = track.scrollWidth - track.clientWidth;
    if (maxX <= 0) { pinEnabled = false; lineup.style.height = ''; return; }
    pinEnabled = true;
    pin.style.position = 'sticky';
    pin.style.top = '0px';
    // The pin (100vh, title + cards inside) sticks at the section top and stays
    // stuck for exactly `maxX` of scrolling — the horizontal travel of the track.
    lineup.style.height = (window.innerHeight + maxX) + 'px';
  }

  function onFrame() {
    var y = window.scrollY;

    // Parallax
    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = 'translate3d(0,' + (-center * speed).toFixed(1) + 'px,0)';
      }
    }

    // Pinned horizontal lineup
    if (pinEnabled && lineup) {
      var start = y + lineup.getBoundingClientRect().top;      // page offset of section top
      var progress = (y - start) / maxX;                       // 0 → 1 across the pinned range
      progress = Math.max(0, Math.min(1, progress));
      track.style.transform = 'translate3d(' + (-progress * maxX).toFixed(1) + 'px,0,0)';
      if (bar) bar.style.width = (progress * 100).toFixed(1) + '%';
    }

    ticking = false;
  }

  var ticking = false;
  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }

  window.addEventListener('scroll', function () { navScroll(); requestFrame(); }, { passive: true });
  window.addEventListener('resize', function () { setupPin(); requestFrame(); }, { passive: true });

  // init
  navScroll();
  setupPin();
  requestFrame();
  // re-measure once layout & web fonts settle (scrollWidth depends on them)
  window.addEventListener('load', function () { setupPin(); requestFrame(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setupPin(); requestFrame(); });
  }
})();
