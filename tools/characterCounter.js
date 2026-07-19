(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <div class="tool-output-header">
          <h3 class="tool-section-title">Input</h3>
          <div class="tool-btn-group">
            <button id="cc-clear" class="tool-btn small danger">Clear</button>
            <button id="cc-copy" class="tool-btn small primary">Copy Text</button>
          </div>
        </div>
        <textarea id="cc-input" class="tool-textarea" style="min-height: 250px;" placeholder="Start typing or paste your text here..."></textarea>
      </div>
      <div class="tool-section">
        <div class="tool-stats">
          <div class="tool-stat">
            <div class="stat-value" id="cc-chars">0</div>
            <div class="stat-label">Characters</div>
          </div>
          <div class="tool-stat">
            <div class="stat-value" id="cc-words">0</div>
            <div class="stat-label">Words</div>
          </div>
          <div class="tool-stat">
            <div class="stat-value" id="cc-sentences">0</div>
            <div class="stat-label">Sentences</div>
          </div>
          <div class="tool-stat">
            <div class="stat-value" id="cc-paragraphs">0</div>
            <div class="stat-label">Paragraphs</div>
          </div>
          <div class="tool-stat">
            <div class="stat-value" id="cc-spaces">0</div>
            <div class="stat-label">Spaces</div>
          </div>
          <div class="tool-stat">
            <div class="stat-value" id="cc-lines">0</div>
            <div class="stat-label">Lines</div>
          </div>
        </div>
        <div class="tool-row" style="margin-top: 1rem;">
          <div class="tool-col">
            <div class="tool-stat">
              <div class="stat-value" id="cc-reading" style="font-size: 1.2rem;">0 min</div>
              <div class="stat-label">Reading Time</div>
            </div>
          </div>
          <div class="tool-col">
            <div class="tool-stat">
              <div class="stat-value" id="cc-speaking" style="font-size: 1.2rem;">0 min</div>
              <div class="stat-label">Speaking Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  function init(container) {
    const inputArea = container.querySelector('#cc-input');
    const clearBtn = container.querySelector('#cc-clear');
    const copyBtn = container.querySelector('#cc-copy');
    
    const charsEl = container.querySelector('#cc-chars');
    const wordsEl = container.querySelector('#cc-words');
    const sentencesEl = container.querySelector('#cc-sentences');
    const paragraphsEl = container.querySelector('#cc-paragraphs');
    const spacesEl = container.querySelector('#cc-spaces');
    const linesEl = container.querySelector('#cc-lines');
    const readingEl = container.querySelector('#cc-reading');
    const speakingEl = container.querySelector('#cc-speaking');

    function updateStats() {
      const text = inputArea.value;
      
      const chars = text.length;
      const words = text.trim() === '' ? 0 : text.trim().split(/\\s+/).filter(w => w.length > 0).length;
      const sentences = text.split(/[.!?]+\\s*/g).filter(s => s.trim().length > 0).length;
      const paragraphs = text === '' ? 0 : text.split(/\\n\\s*\\n/).filter(p => p.trim().length > 0).length;
      const spaces = (text.match(/ /g) || []).length;
      const lines = text === '' ? 0 : text.split('\\n').length;
      
      const readingTime = Math.ceil(words / 200);
      const speakingTime = Math.ceil(words / 130);
      
      charsEl.textContent = chars;
      wordsEl.textContent = words;
      sentencesEl.textContent = sentences;
      paragraphsEl.textContent = paragraphs;
      spacesEl.textContent = spaces;
      linesEl.textContent = lines;
      readingEl.textContent = readingTime + ' min';
      speakingEl.textContent = speakingTime + ' min';
    }

    inputArea.addEventListener('input', updateStats);

    clearBtn.addEventListener('click', () => {
      inputArea.value = '';
      updateStats();
    });

    copyBtn.addEventListener('click', () => {
      const text = inputArea.value;
      if (text) {
        if (window.DevKit && window.DevKit.copyToClipboard) {
          window.DevKit.copyToClipboard(text);
        } else {
          navigator.clipboard.writeText(text);
        }
      }
    });

    updateStats();
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('character-counter', {
        title: 'Character Counter',
        icon: 'fa-solid fa-calculator',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
