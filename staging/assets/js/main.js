/* ============================================================================
   LAKSHMI SREEDHAR — scroll engine + page behaviour
   No dependencies. ~1.6 KB gzipped.

   The whole page is driven by two numbers written into CSS:
     --p   0→1 progress through a [data-scene]      (set on the scene)
     --k   0→1 progress of one element's own window (set on each [data-in])
   CSS does every visual thing with those; JS never touches style beyond them.

   Two modes:
     scroll  — desktop. Scenes are pinned; --k tracks the scrollbar exactly.
     io      — narrow screens / reduced motion. Scenes unpin (CSS), and an
               IntersectionObserver just flips .is-in so CSS transitions run.
============================================================================ */
(function () {
  'use strict';

  var root   = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WA     = '918129948577';
  var PIN_Q  = '(min-width: 901px)';

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ── Bar Council gate ──────────────────────────────────────────────────── */
  (function gate() {
    var el  = document.getElementById('gate');
    var btn = document.getElementById('gate-btn');
    var re  = document.getElementById('gate-reopen');
    var sc  = document.getElementById('gate-scroll');
    if (!el || !btn) return;

    var open = !root.classList.contains('gate-done');

    /* The notice used to fade out its last lines whether or not there was more
       to read, so the text looked truncated. Mark the box only while content
       really is hidden below it, and clear the mark once the reader gets
       there — CSS hangs the fade and the "scroll for the rest" cue off these. */
    function marks() {
      if (!sc) return;
      var over = sc.scrollHeight - sc.clientHeight > 4;
      sc.classList.toggle('can-scroll', over);
      sc.classList.toggle('at-end', !over || sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 6);
    }

    function show() {
      root.classList.remove('gate-done');
      el.classList.remove('is-out');
      document.body.style.overflow = 'hidden';
      if (sc) sc.scrollTop = 0;
      marks();
      btn.focus();
    }
    function hide() {
      el.classList.add('is-out');
      document.body.style.overflow = '';
      /* per visit, not per browser — see the pre-paint script in index.html */
      try { sessionStorage.setItem('ls-ack-v1', '1'); } catch (e) {}
      setTimeout(function () { root.classList.add('gate-done'); }, 520);
    }

    if (sc) {
      sc.addEventListener('scroll', marks, { passive: true });
      window.addEventListener('resize', marks, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(marks);
      marks();
    }

    if (open) { document.body.style.overflow = 'hidden'; btn.focus({ preventScroll: true }); }
    btn.addEventListener('click', hide);
    if (re) re.addEventListener('click', function (e) { e.preventDefault(); show(); });
  })();

  /* ── Collect scenes and their animated children ────────────────────────── */
  var scenes = [].slice.call(document.querySelectorAll('[data-scene]')).map(function (el) {
    return {
      el: el,
      kids: [].slice.call(el.querySelectorAll('[data-in]')).map(function (k) {
        var r = (k.getAttribute('data-in') || '0,1').split(',');
        return {
          el: k,
          a: parseFloat(r[0]) || 0,
          b: parseFloat(r[1]) || 1,
          counters: [].slice.call(k.querySelectorAll('[data-count]'))
        };
      })
    };
  });

  var railItems = [].slice.call(document.querySelectorAll('.rail__item'));

  /* Any region can declare itself light — the opening and scene 02 both do.
     The rail and progress bar invert while one of them owns the upper third. */
  var lightZones = [].slice.call(document.querySelectorAll('[data-tone="light"]'));

  function lightVisible(vh) {
    for (var i = 0; i < lightZones.length; i++) {
      var r = lightZones[i].getBoundingClientRect();
      if (r.top < vh * 0.4 && r.bottom > vh * 0.4) return true;
    }
    return false;
  }

  function paintCounters(list, v) {
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      var target = parseFloat(c.getAttribute('data-count')) || 0;
      var suffix = c.getAttribute('data-count-suffix') || '';
      c.textContent = Math.round(target * v) + suffix;
    }
  }

  /* ── Mode: pinned scroll-linked ────────────────────────────────────────── */
  var rafId = 0;
  var io = null;

  function tick() {
    rafId = 0;
    var vh = window.innerHeight;

    for (var s = 0; s < scenes.length; s++) {
      var sc = scenes[s];
      var r  = sc.el.getBoundingClientRect();

      /* Progress spans the scene's whole travel, not just the pinned part:
         p = 0  when the scene's top touches the bottom of the viewport
         p ≈ vh/height  when it locks to the top (≈0.30 for a 330vh scene)
         p = 1  when the sticky stage starts scrolling away again.
         Reveals therefore run while the scene is arriving, so a scene never
         parks a blank screen in front of the reader. */
      var p = clamp01((vh - r.top) / (r.height || 1));

      sc.el.style.setProperty('--p', p.toFixed(4));

      for (var i = 0; i < sc.kids.length; i++) {
        var k = sc.kids[i];
        var v = k.b > k.a ? clamp01((p - k.a) / (k.b - k.a)) : (p >= k.a ? 1 : 0);
        k.el.style.setProperty('--k', v.toFixed(4));
        if (v > 0.002) k.el.classList.add('is-in'); else k.el.classList.remove('is-in');
        if (k.counters.length) paintCounters(k.counters, v);
      }
    }

    root.classList.toggle('tone-light', lightVisible(vh));

    /* page progress bar */
    var max = document.documentElement.scrollHeight - vh;
    root.style.setProperty('--scroll', max > 0 ? (window.scrollY / max).toFixed(4) : '0');

    /* which section owns the viewport middle */
    var mid = vh * 0.5, activeId = null;
    for (var n = 0; n < scenes.length; n++) {
      var rr = scenes[n].el.getBoundingClientRect();
      if (rr.top <= mid && rr.bottom >= mid) { activeId = scenes[n].el.id; break; }
    }
    for (var m = 0; m < railItems.length; m++) {
      railItems[m].classList.toggle('is-on', railItems[m].getAttribute('data-rail') === activeId);
    }
  }

  function onScroll() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  /* A frame requested while the tab is hidden/occluded may never run, which
     would leave the pending flag set and freeze every scene at its last
     values. Clear the flag and re-measure whenever the page comes back. */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden || mode !== 'scroll') return;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    tick();
  });

  /* ── Mode: IntersectionObserver reveals ────────────────────────────────── */
  function tween(list, ms) {
    var t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var v = clamp01((t - t0) / ms);
      paintCounters(list, v * v * (3 - 2 * v));
      if (v < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function startIO() {
    root.classList.add('mode-io');
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        var cs = e.target.querySelectorAll('[data-count]');
        if (cs.length) reduce ? paintCounters([].slice.call(cs), 1) : tween([].slice.call(cs), 900);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    scenes.forEach(function (sc) {
      sc.el.style.removeProperty('--p');
      sc.kids.forEach(function (k) {
        k.el.style.removeProperty('--k');
        io.observe(k.el);
      });
    });

    /* rail + progress still update, just without the per-element work */
    window.addEventListener('scroll', railOnly, { passive: true });
    railOnly();
  }

  function railOnly() {
    var vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    root.style.setProperty('--scroll', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
    var mid = vh * 0.5, activeId = null;
    scenes.forEach(function (sc) {
      var r = sc.el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) activeId = sc.el.id;
    });
    root.classList.toggle('tone-light', lightVisible(vh));
    railItems.forEach(function (it) {
      it.classList.toggle('is-on', it.getAttribute('data-rail') === activeId);
    });
  }

  function stopIO() {
    if (io) { io.disconnect(); io = null; }
    root.classList.remove('mode-io');
    window.removeEventListener('scroll', railOnly);
  }

  /* ── Mode switching ────────────────────────────────────────────────────── */
  var mode = null;

  function apply() {
    var wantScroll = window.matchMedia(PIN_Q).matches && !reduce &&
                     'requestAnimationFrame' in window;
    var next = wantScroll ? 'scroll' : 'io';
    if (next === mode) return;

    if (mode === 'scroll') {
      window.removeEventListener('scroll', onScroll);
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }
    if (mode === 'io') stopIO();
    mode = next;

    if (mode === 'scroll') {
      window.addEventListener('scroll', onScroll, { passive: true });
      tick();
    } else if ('IntersectionObserver' in window) {
      startIO();
    } else {
      /* very old browser: show everything, no animation */
      root.classList.add('no-motion');
    }
  }

  apply();

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { apply(); if (mode === 'scroll') tick(); else railOnly(); }, 150);
  }, { passive: true });

  /* the sticky-scene maths depends on final layout — re-run once fonts land */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (mode === 'scroll') tick(); });
  }
  window.addEventListener('load', function () { if (mode === 'scroll') tick(); });

  /* ── Footer reveals (outside the scene system) ─────────────────────────── */
  if ('IntersectionObserver' in window) {
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); fo.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    [].slice.call(document.querySelectorAll('.reveal')).forEach(function (el) { fo.observe(el); });
  } else {
    [].slice.call(document.querySelectorAll('.reveal')).forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ── Composer → WhatsApp ───────────────────────────────────────────────── */
  (function composer() {
    var form  = document.getElementById('composer');
    var input = document.getElementById('composer-input');
    if (!form || !input) return;

    [].slice.call(form.querySelectorAll('.chip')).forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-fill');
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      });
    });

    var timer;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) { input.focus(); return; }
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text),
                  '_blank', 'noopener,noreferrer');
      input.value = '';
      form.classList.add('is-sent');
      clearTimeout(timer);
      timer = setTimeout(function () { form.classList.remove('is-sent'); }, 7000);
    });
  })();

})();
