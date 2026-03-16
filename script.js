/* ============================================
   bauwerK! – JavaScript
   Hero animation, navigation, scroll effects
   ============================================ */

(function () {
  'use strict';

  /* ----- DARK MODE TOGGLE ----- */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', currentTheme);
  updateThemeIcon();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', currentTheme);
      updateThemeIcon();
    });
  }

  function updateThemeIcon() {
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln');
    themeToggle.innerHTML = currentTheme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  /* ----- MOBILE MENU ----- */
  const mobileToggle = document.querySelector('.nav__mobile-toggle');
  const mobileMenu = document.querySelector('.nav__mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = !mobileMenu.hidden;
      mobileMenu.hidden = isOpen;
      mobileToggle.setAttribute('aria-expanded', String(!isOpen));
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.hidden = true;
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ----- STICKY NAV BEHAVIOR ----- */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;

    if (current > 100) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }

    // Hide on scroll down, show on scroll up
    if (current > lastScroll && current > 300) {
      nav.classList.add('nav--hidden');
    } else {
      nav.classList.remove('nav--hidden');
    }

    lastScroll = current;
  }, { passive: true });


  /* ----- SCROLL ANIMATIONS FALLBACK ----- */
  if (!CSS.supports('animation-timeline: scroll()')) {
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(el => observer.observe(el));
  }


  /* ----- LUCIDE ICONS ----- */
  if (window.lucide) {
    lucide.createIcons();
  }


  /* ============================================
     HERO CANVAS – Abstract Network Animation
     ============================================ */
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];
  let mouse = { x: -1000, y: -1000 };
  let animationId;

  const CONFIG = {
    nodeCount: 60,
    nodeMinSize: 1.5,
    nodeMaxSize: 3.5,
    connectionDistance: 180,
    mouseRadius: 200,
    speed: 0.3,
    nodeColor: 'rgba(90, 172, 186, ',      // teal
    lineColor: 'rgba(90, 172, 186, ',
    accentColor: 'rgba(139, 212, 223, ',    // lighter teal
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  function createNodes() {
    nodes = [];
    const count = width < 600 ? 30 : CONFIG.nodeCount;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        size: CONFIG.nodeMinSize + Math.random() * (CONFIG.nodeMaxSize - CONFIG.nodeMinSize),
        opacity: 0.3 + Math.random() * 0.5,
        pulse: Math.random() * Math.PI * 2,
        isAccent: Math.random() < 0.15,
      });
    }
  }

  function drawNetwork() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDistance) {
          const opacity = (1 - dist / CONFIG.connectionDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = CONFIG.lineColor + opacity + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw and update nodes
    const time = Date.now() * 0.001;
    for (const node of nodes) {
      // Subtle pulse
      const pulseFactor = 1 + Math.sin(time + node.pulse) * 0.2;

      // Mouse interaction
      const dx = mouse.x - node.x;
      const dy = mouse.y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let glowBoost = 0;

      if (dist < CONFIG.mouseRadius) {
        const force = (1 - dist / CONFIG.mouseRadius) * 0.5;
        node.vx -= (dx / dist) * force * 0.3;
        node.vy -= (dy / dist) * force * 0.3;
        glowBoost = (1 - dist / CONFIG.mouseRadius) * 0.4;
      }

      // Move
      node.x += node.vx;
      node.y += node.vy;

      // Damping
      node.vx *= 0.998;
      node.vy *= 0.998;

      // Bounce
      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
      node.x = Math.max(0, Math.min(width, node.x));
      node.y = Math.max(0, Math.min(height, node.y));

      // Draw
      const color = node.isAccent ? CONFIG.accentColor : CONFIG.nodeColor;
      const finalOpacity = Math.min(1, (node.opacity + glowBoost) * pulseFactor);
      const finalSize = node.size * pulseFactor;

      // Glow
      if (glowBoost > 0.1) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, finalSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = color + glowBoost * 0.3 + ')';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, finalSize, 0, Math.PI * 2);
      ctx.fillStyle = color + finalOpacity + ')';
      ctx.fill();
    }

    animationId = requestAnimationFrame(drawNetwork);
  }

  // Track mouse on hero only
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // Init
  resize();
  createNodes();
  drawNetwork();

  // Resize handling
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      createNodes();
    }, 200);
  });

  // Pause when not visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      drawNetwork();
    }
  });
})();
