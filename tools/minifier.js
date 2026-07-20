(function() {
  'use strict';

  function minifyCSS(code) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  }

  function minifyJS(code) {
    let result = code.replace(/\/\/[^\n]*/g, '');
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/\s+/g, ' ');
    result = result.replace(/\s*([{}();,:<>+\-*\/=&|?!])\s*/g, '$1');
    return result.trim();
  }

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-tabs" style="display:flex;gap:1rem;margin-bottom:1rem;border-bottom:1px solid var(--border-color);">
        <button class="tool-tab active min-tab" data-type="css" style="padding:0.5rem 1rem;background:none;border:none;border-bottom:2px solid var(--primary-color);cursor:pointer;color:var(--text-color);font-weight:bold;">CSS</button>
        <button class="tool-tab min-tab" data-type="js" style="padding:0.5rem 1rem;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;color:var(--text-muted);">JavaScript</button>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Input Code</label>
        <textarea id="min-input" class="tool-textarea" style="min-height:180px;" placeholder="Paste CSS or JS code here..."></textarea>
      </div>

      <div class="tool-btn-group">
        <button id="min-run" class="tool-btn primary">Minify</button>
        <button id="min-copy" class="tool-btn secondary">Copy Output</button>
        <button id="min-clear" class="tool-btn danger">Clear</button>
      </div>

      <div class="tool-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <label class="tool-section-title" style="margin:0;">Minified Output</label>
          <span id="min-stats" style="font-size:0.85rem;color:var(--text-muted);"></span>
        </div>
        <textarea id="min-output" class="tool-textarea" style="min-height:180px;" readonly placeholder="Minified code..."></textarea>
      </div>
    </div>`;
  }

  function init(container) {
    let type = 'css';
    const input = container.querySelector('#min-input');
    const output = container.querySelector('#min-output');
    const stats = container.querySelector('#min-stats');

    container.querySelectorAll('.min-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        type = tab.dataset.type;
        container.querySelectorAll('.min-tab').forEach(t => {
          t.classList.remove('active');
          t.style.borderBottomColor = 'transparent';
          t.style.fontWeight = 'normal';
          t.style.color = 'var(--text-muted)';
        });
        tab.classList.add('active');
        tab.style.borderBottomColor = 'var(--primary-color)';
        tab.style.fontWeight = 'bold';
        tab.style.color = 'var(--text-color)';
        input.placeholder = type === 'css' ? 'Paste CSS code here...' : 'Paste JavaScript code here...';
      });
    });

    function minify() {
      const code = input.value;
      if (!code) {
        output.value = '';
        stats.textContent = '';
        return;
      }
      const result = type === 'css' ? minifyCSS(code) : minifyJS(code);
      output.value = result;
      const saved = code.length - result.length;
      const pct = code.length ? Math.round((saved / code.length) * 100) : 0;
      stats.textContent = `${code.length} → ${result.length} chars (${pct}% smaller)`;
    }

    container.querySelector('#min-run').addEventListener('click', minify);
    container.querySelector('#min-copy').addEventListener('click', () => {
      if (output.value && window.DevKit) window.DevKit.copyToClipboard(output.value);
    });
    container.querySelector('#min-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      stats.textContent = '';
    });
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('code-minifier', {
        title: 'CSS/JS Minifier',
        icon: 'fa-solid fa-compress',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
