/* ========================================
   BlackAngler - Scroll Animation Engine
   Animates EVERY element/object on scroll
   ======================================== */

(function () {
  "use strict";

  // All element selectors to animate on scroll
  var TARGET_SELECTORS = [
    // Headings
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Text
    'p', 'span.fz-font-md', 'span.fz-font-lg',
    // Images
    'img',
    // Buttons & links
    '.at-btn', '.at-btn-border-white',
    // Sections & containers
    'section',
    // Cards & items
    '.at-portfolio-item', '.at-gallery-item',
    '.sec-2-home-5__avatar-sm',
    '.at-offcanvas-gallery-img',
    // Form elements
    '.sec-4-about-form__field', '.sec-4-about-form__actions',
    '.sec-4-about-form__disclaimer',
    // Lists
    'ul', 'li',
    // Icons & SVGs
    '.icon', '.icon-social',
    // Divs with direct content
    '.at-about-title-wrap',
    '.at-about-content',
    '.at-header-logo',
    '.at-footer-widget',
    '.at-footer-copyright',
    '.footer-2-connect-title',
    '.footer-2-hours',
    '.at-hero-social',
    '.alt-footer-social-item',
    '.alt-footer-link-item',
    '.at-categories',
    '.at-categories-item',
    '.at-offcanvas-contact',
    '.at-offcanvas-social',
    '.scroll-rotate',
    '.back-to-top-wrapper',
    // General layout
    '.row',
    '.col-lg-4', '.col-lg-5', '.col-lg-7', '.col-lg-12',
    '.col-xxl-4', '.col-xxl-6',
    '.col-md-6', '.col-md-8',
    // SVG elements
    'svg',
    // Separator / borders
    '.footer-2-border',
    // Specific section wrappers
    '.sec-1-contact',
    '.sec-4-about',
    '.moving-gallery'
  ];

  // Elements to SKIP (inside header, offcanvas, hidden areas)
  var SKIP_PARENTS = [
    'header', '.at-offcanvas', '.at-offcanvas-2-area',
    '.at-search-form-toggle', 'nav', '.at-mobile-menu-active',
    'script', 'style', 'noscript', 'head', '[hidden]'
  ];

  // Direction patterns based on element position
  var DIRECTIONS = ['ba-up', 'ba-up', 'ba-left', 'ba-right', 'ba-scale', 'ba-up'];

  function shouldSkip(el) {
    // Skip elements inside header, nav, offcanvas, hidden containers
    for (var i = 0; i < SKIP_PARENTS.length; i++) {
      if (el.closest(SKIP_PARENTS[i])) return true;
    }
    // Skip invisible or very small elements
    if (el.offsetHeight === 0 && el.offsetWidth === 0) return true;
    // Skip elements already animated by the template
    if (el.classList.contains('ba-scroll')) return true;
    // Skip inline SVG paths, rects, etc.
    if (el.tagName === 'path' || el.tagName === 'rect' || el.tagName === 'circle') return true;
    return false;
  }

  function getDirection(el, index) {
    // Determine animation direction based on element position
    var rect = el.getBoundingClientRect();
    var viewW = window.innerWidth;

    // Images get scale effect
    if (el.tagName === 'IMG') return 'ba-scale';

    // Elements on left half slide from left, right half from right
    var centerX = rect.left + rect.width / 2;
    if (centerX < viewW * 0.35) return 'ba-left';
    if (centerX > viewW * 0.65) return 'ba-right';

    // Default: slide up
    return 'ba-up';
  }

  function initScrollAnimations() {
    var allElements = [];
    var selectorStr = TARGET_SELECTORS.join(', ');

    // Query all matching elements in the main content area
    var candidates = document.querySelectorAll(selectorStr);

    candidates.forEach(function (el) {
      if (shouldSkip(el)) return;

      // Only animate elements inside <main> or <footer> or top-level sections
      var inMain = el.closest('main') || el.closest('footer') || el.closest('.back-to-top-wrapper');
      if (!inMain) return;

      allElements.push(el);
    });

    // Group elements by their parent to create stagger effect
    var parentGroups = new Map();

    allElements.forEach(function (el) {
      var parent = el.parentElement;
      if (!parentGroups.has(parent)) {
        parentGroups.set(parent, []);
      }
      parentGroups.get(parent).push(el);
    });

    // Apply animation classes with stagger
    parentGroups.forEach(function (children) {
      children.forEach(function (el, i) {
        var dir = getDirection(el, i);
        el.classList.add('ba-scroll', dir);

        // Stagger siblings
        var delay = Math.min(i, 12);
        if (delay > 0) {
          el.classList.add('ba-d' + delay);
        }
      });
    });

    // Set up IntersectionObserver
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('ba-in');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });

      allElements.forEach(function (el) {
        observer.observe(el);
      });
    } else {
      // Fallback: show everything immediately
      allElements.forEach(function (el) {
        el.classList.add('ba-in');
      });
    }
  }

  // --- Magnetic hover for buttons ---
  function initMagneticButtons() {
    var btns = document.querySelectorAll('main .at-btn, footer .at-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.12) + 'px, ' + (y * 0.12) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  // --- Smooth image load reveal ---
  function initImageReveal() {
    var images = document.querySelectorAll('main img, footer img');
    images.forEach(function (img) {
      if (!img.complete) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';
        img.addEventListener('load', function () {
          img.style.opacity = '';
        });
        setTimeout(function () { img.style.opacity = ''; }, 4000);
      }
    });
  }

  // --- Init ---
  function init() {
    // Small delay to let the page render first
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        initScrollAnimations();
        initMagneticButtons();
        initImageReveal();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
