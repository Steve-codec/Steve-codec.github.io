(function() {
  const ScrollManager = {
    lastScrollY: 0,
    
    init() {
      if (this.initialized) return;
      this.initialized = true;
      this.bindScroll();
      this.initBackToTop();
      this.initMobileMenu();
      this.bindHomeLinks();
    },
    
    // Re-selecting the current homepage should scroll up rather than reload it.
    bindHomeLinks() {
      document.addEventListener('click', event => {
        const link = event.target.closest('#navbar a[href]');
        if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const target = new URL(link.href, window.location.href);
        if (target.origin !== window.location.origin || target.pathname.replace(/\/$/, '') !== window.location.pathname.replace(/\/$/, '') || target.hash) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        this.closeMobileMenu();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, true);
    },

    bindScroll() {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    },
    
    handleScroll() {
      const scrollY = window.scrollY;
      const navbar = document.getElementById('navbar');
      
      if (navbar) {
        if (scrollY > 10) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
      
      this.lastScrollY = scrollY;
    },
    // Close mobile menu helper
    closeMobileMenu() {
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      const menu = document.getElementById('navbar-menu');
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        var icon = toggleBtn.querySelector('.material-symbols-outlined');
        if (icon) icon.textContent = 'menu';
      }
      if (menu) {
        const links = menu.querySelector('.navbar-links');
        if (links) links.classList.remove('open');
      }
      const backdrop = document.querySelector('.mobile-menu-backdrop');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    },

    // Mobile menu toggle with backdrop overlay
    initMobileMenu() {
      const toggleBtn = document.getElementById('mobile-menu-toggle');
      if (!toggleBtn) return;
      
      // Create backdrop element for mobile menu overlay if missing
      let backdrop = document.querySelector('.mobile-menu-backdrop');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'mobile-menu-backdrop';
        document.body.appendChild(backdrop);
      }

      const closeMenu = () => this.closeMobileMenu();

      // Show toggle only when navbar links overflow or on mobile screens
      const checkOverflow = () => {
        const navbar = document.getElementById('navbar');
        const navbarInner = document.querySelector('#navbar .navbar-inner');
        const menu = document.getElementById('navbar-menu');
        if (!navbarInner || !navbar || !menu) return;
        const links = menu.querySelector('.navbar-links');
        if (!links) return;

        const brand = navbarInner.querySelector('.navbar-brand');
        const actions = navbarInner.querySelector('.navbar-actions');
        const available = navbarInner.offsetWidth - (brand ? brand.offsetWidth : 0) - (actions ? actions.offsetWidth : 0) - 40;

        if (links.scrollWidth > available || window.innerWidth <= 768) {
          toggleBtn.classList.add('visible');
          navbar.classList.add('mobile-nav');
        } else {
          toggleBtn.classList.remove('visible');
          navbar.classList.remove('mobile-nav');
          closeMenu();
        }
      };
      
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      document.addEventListener('pjax:complete', checkOverflow);
      
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById('navbar-menu');
        if (!menu) return;
        const links = menu.querySelector('.navbar-links');
        if (!links) return;

        let bg = document.querySelector('.mobile-menu-backdrop');
        if (!bg) {
          bg = document.createElement('div');
          bg.className = 'mobile-menu-backdrop';
          document.body.appendChild(bg);
        }

        if (links.classList.contains('open')) {
          closeMenu();
        } else {
          // Close other popups for mutual exclusion
          const themePopover = document.getElementById('theme-popover');
          if (themePopover) themePopover.classList.add('closed');
          const displayPanel = document.getElementById('display-settings-panel');
          if (displayPanel) displayPanel.classList.add('closed');

          links.classList.add('open');
          bg.classList.add('open');
          toggleBtn.setAttribute('aria-expanded', 'true');
          var icon = toggleBtn.querySelector('.material-symbols-outlined');
          if (icon) icon.textContent = 'close';
        }
      });

      // Global delegate click listener for backdrop, links, and dropdown toggles
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-menu-backdrop')) {
          closeMenu();
          return;
        }

        const menu = document.getElementById('navbar-menu');
        if (!menu) return;

        if (menu.contains(e.target)) {
          const dropdownToggle = e.target.closest('.dropdown-toggle');
          if (dropdownToggle && window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();
            const parent = dropdownToggle.closest('.navbar-dropdown');
            if (parent) {
              parent.classList.toggle('open');
            }
            return;
          }

          const link = e.target.closest('a');
          if (link && !link.classList.contains('dropdown-toggle')) {
            closeMenu();
          }
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeMenu();
        }
      });

      this.initNavbarExtraButtons();
    },

    // Extra topbar buttons: Music & Play/Wallpaper
    initNavbarExtraButtons() {
      const musicBtn = document.getElementById('nav-music-btn');
      if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          var player = window.MusicPlayer && window.MusicPlayer.getActivePlayer();
          if (player) {
            player.toggle();
          } else {
            const widget = document.querySelector('.music-widget');
            if (widget) {
              widget.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      }

    },
    
    // Back to top
    initBackToTop() {
      const btn = document.querySelector('.back-to-top-btn');
      if (!btn) return;
      
      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      }, { passive: true });
      
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };
  
  window.ScrollManager = ScrollManager;
  document.addEventListener('DOMContentLoaded', () => ScrollManager.init());
})();
