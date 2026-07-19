(function() {
  'use strict';

  window.DevKit = {
    tools: {},
    recentTools: JSON.parse(sessionStorage.getItem('devkit-recent') || '[]'),
    favorites: JSON.parse(localStorage.getItem('devkit-favorites') || '[]'),
    usageStats: JSON.parse(sessionStorage.getItem('devkit-usage') || '{}'),
    
    registerTool(id, toolObj) {
      this.tools[id] = toolObj;
    },
    
    openTool(id) {
      const tool = this.tools[id];
      if (!tool) return;
      this.openModal(tool.title, tool.icon, tool.getContent());
      
      requestAnimationFrame(() => {
        tool.init(document.getElementById('modal-body'));
      });
      this.trackUsage(id);
    },
    
    openModal(title, icon, contentHTML) {
      document.getElementById('modal-title-text').textContent = title;
      document.getElementById('modal-icon').className = icon;
      document.getElementById('modal-body').innerHTML = contentHTML;
      document.getElementById('modal-overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    
    closeModal() {
      document.getElementById('modal-overlay').classList.remove('active');
      document.body.style.overflow = '';
      document.getElementById('modal-body').innerHTML = '';
    },
    
    showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
      toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>`;
      container.appendChild(toast);
      setTimeout(() => { 
        toast.style.animation = 'fadeOut 0.3s ease forwards'; 
        setTimeout(() => toast.remove(), 300); 
      }, 3000);
    },
    
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.showToast('Copied to clipboard!', 'success');
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        this.showToast('Copied to clipboard!', 'success');
      }
    },
    
    trackUsage(toolId) {
      this.usageStats[toolId] = (this.usageStats[toolId] || 0) + 1;
      sessionStorage.setItem('devkit-usage', JSON.stringify(this.usageStats));
      
      this.recentTools = [toolId, ...this.recentTools.filter(t => t !== toolId)].slice(0, 5);
      sessionStorage.setItem('devkit-recent', JSON.stringify(this.recentTools));
    },
    
    toggleFavorite(toolId) {
      const idx = this.favorites.indexOf(toolId);
      if (idx > -1) { 
        this.favorites.splice(idx, 1); 
      } else { 
        this.favorites.push(toolId); 
      }
      localStorage.setItem('devkit-favorites', JSON.stringify(this.favorites));
      this.updateFavoriteButtons();
    },
    
    isFavorite(toolId) { 
      return this.favorites.includes(toolId); 
    },
    
    updateFavoriteButtons() {
      document.querySelectorAll('.tool-card').forEach(card => {
        const id = card.dataset.tool;
        const btn = card.querySelector('.card-favorite');
        if (btn) {
          const icon = btn.querySelector('i');
          if (this.isFavorite(id)) {
            icon.className = 'fa-solid fa-heart';
            btn.classList.add('active');
          } else {
            icon.className = 'fa-regular fa-heart';
            btn.classList.remove('active');
          }
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Loading Screen
    setTimeout(() => {
      const loader = document.getElementById('loading-screen');
      if (loader) {
        loader.classList.add('loaded');
        setTimeout(() => loader.remove(), 500);
      }
    }, 800);

    // 2. Navbar & Hamburger
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
      } else {
        navbar?.classList.remove('scrolled');
      }
    });

    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
      });

      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          mobileMenu.classList.remove('active');
        });
      });
    }

    // 3. Tool Cards
    document.querySelectorAll('.tool-card').forEach(card => {
      card.addEventListener('click', () => {
        DevKit.openTool(card.dataset.tool);
      });
      const favBtn = card.querySelector('.card-favorite');
      if (favBtn) {
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          DevKit.toggleFavorite(card.dataset.tool);
        });
      }
    });
    DevKit.updateFavoriteButtons();

    // 4. Modal
    const modalClose = document.getElementById('modal-close');
    const modalOverlay = document.getElementById('modal-overlay');
    
    if (modalClose) {
      modalClose.addEventListener('click', () => DevKit.closeModal());
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) DevKit.closeModal();
      });
    }
    
    // 5. Back to Top
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      });
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // 6. Smooth Scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // 7. Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }
      if (e.key === 'Escape') {
        DevKit.closeModal();
      }
    });

    // 8. Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle && window.ThemeManager) {
      themeToggle.addEventListener('click', () => ThemeManager.toggle());
    }

    // 10. Scroll Animations
    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.tool-card, .feature-card').forEach(el => {
        observer.observe(el);
      });
    }

    // 9. Dispatch Ready Event
    document.dispatchEvent(new Event('devkit-ready'));
  });
})();
