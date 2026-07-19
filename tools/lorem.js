(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <h3 class="tool-section-title">Settings</h3>
        <div class="tool-row">
          <div class="tool-col">
            <label class="tool-stat"><span class="stat-label">Type</span></label>
            <select id="lorem-type" class="tool-select">
              <option value="words">Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraphs" selected>Paragraphs</option>
            </select>
          </div>
          <div class="tool-col">
            <label class="tool-stat"><span class="stat-label">Count</span></label>
            <input type="number" id="lorem-count" class="tool-input" value="3" min="1" max="100">
          </div>
        </div>
        <div class="tool-row" style="margin-top: 1rem;">
          <label class="tool-checkbox-group">
            <input type="checkbox" id="lorem-start" checked>
            Start with "Lorem ipsum dolor sit amet..."
          </label>
        </div>
        <div class="tool-row" style="margin-top: 1rem;">
          <button id="lorem-generate" class="tool-btn primary">Generate Lorem Ipsum</button>
        </div>
      </div>
      <div class="tool-section">
        <div class="tool-output-header">
          <h3 class="tool-section-title">Result</h3>
          <button id="lorem-copy" class="tool-btn small"><i class="fa-solid fa-copy"></i> Copy</button>
        </div>
        <div id="lorem-output" class="tool-output" style="min-height: 150px; white-space: pre-wrap;"></div>
        <div class="tool-stats" style="margin-top: 1rem;">
          <div class="tool-stat">
            <div class="stat-value" id="lorem-char-count">0</div>
            <div class="stat-label">Characters</div>
          </div>
          <div class="tool-stat">
            <div class="stat-value" id="lorem-word-count">0</div>
            <div class="stat-label">Words</div>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  const wordBank = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 
    'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 
    'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 
    'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 
    'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 
    'mollit', 'anim', 'id', 'est', 'laborum', 'blandit', 'volutpat', 'maecenas', 'accumsan', 
    'lacus', 'vel', 'facilisis', 'viverra', 'tellus', 'integer', 'feugiat', 'scelerisque', 
    'varius', 'morbi', 'sagittis', 'pulvinar', 'mattis', 'nunc', 'faucibus', 'ornare', 
    'suspendisse', 'interdum', 'posuere'
  ];

  function getRandomWord() {
    return wordBank[Math.floor(Math.random() * wordBank.length)];
  }

  function generateSentence(isFirst, useStartPhrase) {
    if (isFirst && useStartPhrase) {
      const restWords = [];
      const len = Math.floor(Math.random() * 8) + 3;
      for(let i=0; i<len; i++) restWords.push(getRandomWord());
      return 'Lorem ipsum dolor sit amet, ' + restWords.join(' ') + '.';
    }
    const len = Math.floor(Math.random() * 8) + 8; // 8-15 words
    let words = [];
    for(let i=0; i<len; i++) {
      words.push(getRandomWord());
    }
    let sentence = words.join(' ') + '.';
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
  }

  function generateParagraph(isFirst, useStartPhrase) {
    const len = Math.floor(Math.random() * 4) + 3; // 3-6 sentences
    let sentences = [];
    for(let i=0; i<len; i++) {
      sentences.push(generateSentence(isFirst && i === 0, useStartPhrase));
    }
    return sentences.join(' ');
  }

  function init(container) {
    const typeSelect = container.querySelector('#lorem-type');
    const countInput = container.querySelector('#lorem-count');
    const startCheckbox = container.querySelector('#lorem-start');
    const generateBtn = container.querySelector('#lorem-generate');
    const copyBtn = container.querySelector('#lorem-copy');
    const outputArea = container.querySelector('#lorem-output');
    const charCount = container.querySelector('#lorem-char-count');
    const wordCount = container.querySelector('#lorem-word-count');

    function updateStats(text) {
      charCount.textContent = text.length;
      wordCount.textContent = text.trim() ? text.trim().split(/\\s+/).length : 0;
    }

    function generate() {
      const type = typeSelect.value;
      const count = parseInt(countInput.value) || 1;
      const useStart = startCheckbox.checked;
      
      let result = '';
      if (type === 'words') {
        let words = [];
        if (useStart) {
          const starter = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'];
          words = starter.slice(0, count);
          for(let i=words.length; i<count; i++) words.push(getRandomWord());
        } else {
          for(let i=0; i<count; i++) words.push(getRandomWord());
        }
        result = words.join(' ');
      } else if (type === 'sentences') {
        let sentences = [];
        for(let i=0; i<count; i++) {
          sentences.push(generateSentence(i === 0, useStart));
        }
        result = sentences.join(' ');
      } else if (type === 'paragraphs') {
        let paragraphs = [];
        for(let i=0; i<count; i++) {
          paragraphs.push(generateParagraph(i === 0, useStart));
        }
        result = paragraphs.join('\\n\\n');
      }

      outputArea.textContent = result;
      updateStats(result);
    }

    generateBtn.addEventListener('click', generate);

    copyBtn.addEventListener('click', () => {
      const text = outputArea.textContent;
      if (text) {
        if (window.DevKit && window.DevKit.copyToClipboard) {
          window.DevKit.copyToClipboard(text);
        } else {
          navigator.clipboard.writeText(text);
        }
      }
    });

    // Initial generate
    generate();
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('lorem-generator', {
        title: 'Lorem Ipsum Generator',
        icon: 'fa-solid fa-paragraph',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
