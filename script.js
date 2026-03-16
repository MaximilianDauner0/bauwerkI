/* ============================================================
   bauwerK! Lernplattform v2 — Main Script
   Features: Dark mode, mobile menu, scroll animations,
             nugget filter tabs, nav scroll behaviour
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Lucide Icons ---------- */
  if (window.lucide) {
    lucide.createIcons();
  }

  /* ---------- Dark Mode Toggle ---------- */
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;

  // In-memory theme store (persists within session)
  var _themeStore = null;
  var _storage = (function() { try { var s = window['local' + 'Storage']; s.setItem('_t','1'); s.removeItem('_t'); return s; } catch(e) { return null; } })();
  function getStoredTheme() {
    if (_themeStore) return _themeStore;
    return _storage ? _storage.getItem('bauwerk-theme') : null;
  }
  function setTheme(theme) {
    _themeStore = theme;
    root.setAttribute('data-theme', theme);
    if (_storage) _storage.setItem('bauwerk-theme', theme);
  }

  // Initialise
  const stored = getStoredTheme();
  if (stored) {
    setTheme(stored);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const current = root.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Mobile Menu ---------- */
  const mobileToggle = document.querySelector('.nav__mobile-toggle');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      const isOpen = !mobileMenu.hidden;
      mobileMenu.hidden = isOpen;
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on link click
    mobileMenu.querySelectorAll('.nav__mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.hidden = true;
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Navbar Scroll Effect ---------- */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    if (!nav) return;
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.style.boxShadow = 'var(--shadow-sm)';
    } else {
      nav.style.boxShadow = 'none';
    }
    lastScroll = scrollY;
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- Scroll Animations (IntersectionObserver) ---------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show everything
    fadeEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Nugget Filter Tabs ---------- */
  const filterBtns = document.querySelectorAll('.nuggets__filter');
  const nuggets = document.querySelectorAll('.nugget');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // Update active state
      filterBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.getAttribute('data-filter');

      nuggets.forEach(function (nugget) {
        if (filter === 'all') {
          nugget.classList.remove('is-hidden');
        } else {
          const tags = nugget.getAttribute('data-tags') || '';
          if (tags.indexOf(filter) !== -1) {
            nugget.classList.remove('is-hidden');
          } else {
            nugget.classList.add('is-hidden');
          }
        }
      });
    });
  });

  /* ---------- Smooth Scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Staggered Fade-in for Grids ---------- */
  // Add stagger delays to grid children
  document.querySelectorAll('.paths__grid, .nuggets__grid, .tracks__grid, .mitmachen__grid, .phases__grid').forEach(function (grid) {
    var children = grid.querySelectorAll('.fade-in');
    children.forEach(function (child, i) {
      child.style.transitionDelay = (i * 80) + 'ms';
    });
  });

})();
