/**
 * VALORANT PROTOCOL // SMOOTH SCROLLING & MOTION ARCHITECTURE
 * Core Engine: Lenis v1.1 + GSAP 3.12 + ScrollTrigger + Three.js Sync
 * 
 * Provides buttery-smooth momentum scrolling, GSAP animation ticker integration,
 * seamless anchor navigation with tactical offsets, and Three.js 3D hooks.
 */

class ValorantSmoothScrollController {
  constructor() {
    this.lenis = null;
    this.wrapper = null;
    this.content = null;
    this.init();
  }

  init() {
    // 1. Verify and instantiate Lenis smooth scroll
    if (typeof Lenis === 'undefined') {
      console.warn('[Valorant Protocol] Lenis engine not detected. Falling back to native scrolling.');
      return;
    }

    this.wrapper = document.getElementById('smooth-wrapper');
    this.content = document.getElementById('smooth-content');

    this.lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.6,
      infinite: false,
    });

    // Make Lenis globally accessible
    window.lenis = this.lenis;

    // 2. Integrate with GSAP & ScrollTrigger
    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Synchronize Lenis scroll updates with GSAP ScrollTrigger
        this.lenis.on('scroll', ScrollTrigger.update);

        // Drive Lenis RAF from GSAP's central animation ticker
        gsap.ticker.add((time) => {
          this.lenis.raf(time * 1000);
        });

        // Disable GSAP lag smoothing to prevent jitter during fast scrolls
        gsap.ticker.lagSmoothing(0);
      } else {
        // Fallback ticker if ScrollTrigger isn't present
        const raf = (time) => {
          this.lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
      }
    } else {
      // Fallback RAF
      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }

    // 3. Bind anchor links and UI navigation
    this.bindAnchorInteractions();

    // 4. Initialize tactical scroll reveals via GSAP ScrollTrigger
    this.initTacticalScrollAnimations();

    // 5. Expose Three.js integration helper
    this.initThreeBridge();

    console.log('[Valorant Protocol] Smooth-scrolling wrapper initialized with Lenis & GSAP.');
  }

  bindAnchorInteractions() {
    // Intercept clicks on all smooth scroll anchors
    document.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href === '#' || !href) return;

      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        this.scrollToElement(targetEl);
      }
    });

    // Provide quick scrollTo helper on window
    window.protocolScrollTo = (target, options = {}) => {
      this.scrollToElement(target, options);
    };
  }

  scrollToElement(target, options = {}) {
    if (!this.lenis) {
      if (typeof target === 'string') target = document.querySelector(target);
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const defaultOptions = {
      offset: -76, // Height of fixed tactical navbar
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      ...options
    };

    this.lenis.scrollTo(target, defaultOptions);
  }

  initTacticalScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    // Subtle, high-performance tactical section reveals
    const sections = document.querySelectorAll('.val-section');
    sections.forEach((section) => {
      const header = section.querySelector('.section-header, .section-header-block');
      if (header) {
        gsap.fromTo(
          header,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });
  }

  initThreeBridge() {
    // Provide a helper for Three.js scene creation and GSAP ticker sync
    window.ValorantThreeBridge = {
      isAvailable: typeof THREE !== 'undefined',
      createRenderer: (canvas) => {
        if (typeof THREE === 'undefined') {
          console.warn('[Valorant Protocol] Three.js not loaded.');
          return null;
        }
        return new THREE.WebGLRenderer({
          canvas: canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
      },
    };
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.valorantSmoothScroll = new ValorantSmoothScrollController();
  });
} else {
  window.valorantSmoothScroll = new ValorantSmoothScrollController();
}
