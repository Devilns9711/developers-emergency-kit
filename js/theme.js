(function() {
  'use strict';

  const ThemeManager = {
    toggle() {
      const current = this.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      this.setTheme(next);
    },

    getTheme() {
      return localStorage.getItem('devkit-theme') || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('devkit-theme', theme);
      
      const toggleBtn = document.getElementById('theme-toggle');
      if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      }

      // Update highlight.js theme
      const links = document.getElementsByTagName('link');
      for (let i = 0; i < links.length; i++) {
        if (links[i].href.includes('highlight.js')) {
          links[i].href = theme === 'dark' ? 
            'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github-dark.min.css' : 
            'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css';
          break;
        }
      }
    }
  };

  window.ThemeManager = ThemeManager;

  // Initialize theme on load
  document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.setTheme(ThemeManager.getTheme());
  });
})();
