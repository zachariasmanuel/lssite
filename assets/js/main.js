/* ============================================================
   LAKSHMI SREEDHAR — Minimal Vanilla JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Bar Council Disclaimer Modal ── */
  var disclaimerOverlay = document.getElementById('disclaimer-overlay');
  var disclaimerBtn = document.getElementById('disclaimer-agree');
  var disclaimerContent = document.getElementById('disclaimer-content');

  if (disclaimerBtn && disclaimerOverlay) {
    document.body.style.overflow = 'hidden';

    // Auto-scroll content slowly after 2 seconds
    if (disclaimerContent) {
      var autoScrolling = true;

      // Stop auto-scroll when user touches or interacts with the content
      disclaimerContent.addEventListener('touchstart', function () { autoScrolling = false; }, { passive: true });
      disclaimerContent.addEventListener('mousedown', function () { autoScrolling = false; });
      disclaimerContent.addEventListener('wheel', function () { autoScrolling = false; }, { passive: true });

      setTimeout(function () {
        function step() {
          if (!autoScrolling) return;
          var atBottom = disclaimerContent.scrollTop + disclaimerContent.clientHeight >= disclaimerContent.scrollHeight - 2;
          if (atBottom) return;
          disclaimerContent.scrollTop += 0.5;
          requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, 2000);
    }

    disclaimerBtn.addEventListener('click', function () {
      disclaimerOverlay.classList.add('is-hidden');
      document.body.style.overflow = '';
    });
  }

  /* ── Sticky Nav ── */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on load

  /* ── Mobile Menu ── */
  const navToggle = document.getElementById('nav-toggle');
  const navOverlay = document.getElementById('nav-overlay');
  const navOverlayLinks = navOverlay ? navOverlay.querySelectorAll('a') : [];

  function openMenu() {
    navToggle.classList.add('is-active');
    navOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    navToggle.classList.remove('is-active');
    navOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      const isOpen = navOverlay.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
  }

  navOverlayLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ── Smooth Scroll (for anchor links) ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── Scroll Reveal ── */
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    reveals.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }
})();
