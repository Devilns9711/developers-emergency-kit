(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const toolsGrid = document.getElementById('tools-grid');
    const filterTabs = document.querySelectorAll('.filter-tab');
    
    if (!searchInput || !toolsGrid) return;
    
    const cards = Array.from(toolsGrid.querySelectorAll('.tool-card'));
    let activeFilter = 'all';

    function filterCards() {
      const query = searchInput.value.toLowerCase();
      let hasMatches = false;

      cards.forEach(card => {
        const id = card.dataset.tool;
        const tags = (card.dataset.tags || '').toLowerCase();
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
        
        const matchesQuery = !query || tags.includes(query) || title.includes(query) || desc.includes(query);
        let matchesFilter = true;
        
        if (activeFilter === 'recent') {
          matchesFilter = window.DevKit && window.DevKit.recentTools.includes(id);
        } else if (activeFilter === 'favorites') {
          matchesFilter = window.DevKit && window.DevKit.favorites.includes(id);
        }
        
        if (matchesQuery && matchesFilter) {
          card.classList.remove('hidden');
          card.style.display = '';
          hasMatches = true;
        } else {
          card.classList.add('hidden');
          card.style.display = 'none';
        }
      });

      let noMatchMsg = document.getElementById('no-match-message');
      if (!hasMatches) {
        if (!noMatchMsg) {
          noMatchMsg = document.createElement('div');
          noMatchMsg.id = 'no-match-message';
          noMatchMsg.className = 'tool-section-title';
          noMatchMsg.style.textAlign = 'center';
          noMatchMsg.style.width = '100%';
          noMatchMsg.textContent = 'No tools found';
          toolsGrid.appendChild(noMatchMsg);
        }
        noMatchMsg.style.display = 'block';
      } else if (noMatchMsg) {
        noMatchMsg.style.display = 'none';
      }
    }

    searchInput.addEventListener('input', filterCards);

    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const text = tab.textContent.trim().toLowerCase();
        if (text.includes('all')) {
          activeFilter = 'all';
        } else if (text.includes('recent')) {
          activeFilter = 'recent';
        } else if (text.includes('favorite')) {
          activeFilter = 'favorites';
        }
        filterCards();
      });
    });
  });
})();
