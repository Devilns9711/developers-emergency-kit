(function() {
  'use strict';

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <textarea id="hash-input" class="tool-textarea" style="min-height:120px;" placeholder="Enter text to hash..."></textarea>
      </div>

      <div class="tool-section">
        <div class="tool-row" style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;">
          <select id="hash-algo" class="tool-select" style="min-width:160px;">
            <option value="MD5">MD5</option>
            <option value="SHA1">SHA-1</option>
            <option value="SHA256">SHA-256</option>
            <option value="SHA512">SHA-512</option>
          </select>
          <button id="hash-generate" class="tool-btn primary">Generate Hash</button>
          <button id="hash-copy" class="tool-btn secondary">Copy</button>
          <button id="hash-clear" class="tool-btn danger">Clear</button>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Hash Output</label>
        <div id="hash-output" class="tool-output" style="font-family:'JetBrains Mono',monospace;font-size:0.9rem;word-break:break-all;min-height:48px;">
          <span style="color:var(--text-muted);">Hash will appear here</span>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">All Algorithms</label>
        <div id="hash-all" class="tool-output" style="font-family:'JetBrains Mono',monospace;font-size:0.85rem;"></div>
      </div>
    </div>`;
  }

  function hashText(text, algo) {
    if (!window.CryptoJS) return null;
    return CryptoJS[algo](text).toString(CryptoJS.enc.Hex);
  }

  function updateAllHashes(container, text) {
    const allEl = container.querySelector('#hash-all');
    if (!text || !window.CryptoJS) {
      allEl.innerHTML = '<span style="color:var(--text-muted);">Enter text above</span>';
      return;
    }
    const algos = ['MD5', 'SHA1', 'SHA256', 'SHA512'];
    allEl.innerHTML = algos.map(a =>
      `<div style="padding:0.5rem 0;border-bottom:1px solid var(--border);">
        <strong style="color:var(--text-muted);font-size:0.8rem;">${a}</strong><br>
        <span style="word-break:break-all;">${hashText(text, a)}</span>
      </div>`
    ).join('');
  }

  function init(container) {
    const input = container.querySelector('#hash-input');
    const output = container.querySelector('#hash-output');
    const algoSelect = container.querySelector('#hash-algo');

    function generate() {
      const text = input.value;
      if (!text) {
        output.innerHTML = '<span style="color:var(--text-muted);">Hash will appear here</span>';
        updateAllHashes(container, '');
        return;
      }
      if (!window.CryptoJS) {
        output.innerHTML = '<span style="color:#ef4444;">crypto-js library not loaded</span>';
        return;
      }
      const hash = hashText(text, algoSelect.value);
      output.textContent = hash;
      updateAllHashes(container, text);
    }

    container.querySelector('#hash-generate').addEventListener('click', generate);
    input.addEventListener('input', generate);
    algoSelect.addEventListener('change', generate);

    container.querySelector('#hash-copy').addEventListener('click', () => {
      const text = output.textContent;
      if (text && !text.includes('appear here') && window.DevKit) {
        window.DevKit.copyToClipboard(text);
      }
    });

    container.querySelector('#hash-clear').addEventListener('click', () => {
      input.value = '';
      generate();
    });
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('hash-generator', {
        title: 'Hash Generator',
        icon: 'fa-solid fa-hashtag',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
