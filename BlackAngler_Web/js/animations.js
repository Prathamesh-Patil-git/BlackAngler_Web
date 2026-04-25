/* ========================================
   BlackAngler Scroll & Interaction Animations
   ======================================== */

(function () {
  "use strict";

  // --- Intersection Observer for scroll-triggered animations ---
  function initScrollAnimations() {
    // Auto-apply animation classes to key elements
    const selectors = [
      { sel: '.at-about-title-wrap', cls: 'ba-fade-up' },
      { sel: '.at-section-title', cls: 'ba-fade-up' },
      { sel: '.sec-4-about-form', cls: 'ba-fade-up' },
      { sel: '.at-portfolio-item', cls: 'ba-scale-in' },
      { sel: '.sec-2-home-5__avatar-sm', cls: 'ba-scale-in' },
      { sel: '.at-footer-area', cls: 'ba-fade-up' },
      { sel: '.at-offcanvas-gallery-img', cls: 'ba-scale-in' },
      { sel: 'section > .container > .row', cls: 'ba-fade-up' },
    ];

    selectors.forEach(function (item) {
      var elements = document.querySelectorAll(item.sel);
      elements.forEach(function (el, i) {
        if (!el.classList.contains('ba-animate') &&
            !el.classList.contains('ba-fade-up') &&
            !el.classList.contains('ba-fade-down') &&
            !el.classList.contains('ba-fade-left') &&
            !el.classList.contains('ba-fade-right') &&
            !el.classList.contains('ba-scale-in')) {
          el.classList.add(item.cls);
          // Add stagger delay for grouped items
          var delay = Math.min(i, 5);
          if (delay > 0) {
            el.classList.add('ba-delay-' + delay);
          }
        }
      });
    });

    // Observe all animation elements
    var animElements = document.querySelectorAll(
      '.ba-animate, .ba-fade-up, .ba-fade-down, .ba-fade-left, .ba-fade-right, .ba-scale-in'
    );

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('ba-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      });

      animElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show everything
      animElements.forEach(function (el) {
        el.classList.add('ba-visible');
      });
    }
  }

  // --- Smooth counter animation ---
  function animateCounters() {
    var counters = document.querySelectorAll('[data-count], .counter, .at-counter');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count') || el.textContent, 10);
          if (isNaN(target)) return;

          var start = 0;
          var duration = 1500;
          var startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target;
            }
          }
          requestAnimationFrame(step);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  // --- Magnetic hover effect for buttons ---
  function initMagneticButtons() {
    var btns = document.querySelectorAll('.at-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  // --- Parallax on mouse move for hero sections ---
  function initParallaxMouse() {
    var hero = document.querySelector('section:first-of-type');
    if (!hero) return;

    var parallaxItems = hero.querySelectorAll('.scroll-rotate, .sec-2-home-5__avatar-sm');
    if (!parallaxItems.length) return;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;

      parallaxItems.forEach(function (item, i) {
        var speed = (i + 1) * 8;
        item.style.transform = 'translate(' + (x * speed) + 'px, ' + (y * speed) + 'px)';
      });
    });

    hero.addEventListener('mouseleave', function () {
      parallaxItems.forEach(function (item) {
        item.style.transform = '';
      });
    });
  }

  // --- Smooth reveal for images ---
  function initImageReveal() {
    var images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(function (img) {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.6s ease';

      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.addEventListener('load', function () {
          img.style.opacity = '1';
        });
        // Fallback timeout
        setTimeout(function () {
          img.style.opacity = '1';
        }, 3000);
      }
    });
  }

  // --- Typing effect for hero titles ---
  function initCursorBlink() {
    var titles = document.querySelectorAll('.at-section-title');
    titles.forEach(function (title) {
      title.style.borderRight = 'none';
    });
  }

  // --- Initialize all animations ---
  function init() {
    initScrollAnimations();
    animateCounters();
    initMagneticButtons();
    initImageReveal();
    initCursorBlink();

    // Delay parallax to avoid janky initial load
    setTimeout(initParallaxMouse, 1000);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
