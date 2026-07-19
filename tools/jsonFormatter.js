(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <textarea id="json-input" class="tool-textarea" style="min-height: 200px; font-family: 'JetBrains Mono', monospace;" placeholder="Paste JSON here..."></textarea>
      </div>
      
      <div class="tool-section">
        <div class="tool-btn-group" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button id="json-beautify" class="tool-btn primary">Beautify</button>
          <button id="json-minify" class="tool-btn secondary">Minify</button>
          <button id="json-validate" class="tool-btn secondary">Validate</button>
          <button id="json-copy" class="tool-btn secondary">Copy Output</button>
          <button id="json-clear" class="tool-btn danger">Clear</button>
        </div>
      </div>
      
      <div id="json-error" class="tool-error" style="display: none; padding: 1rem; border-radius: 4px; background: rgba(239, 68, 68, 0.1); color: #ef4444; margin-bottom: 1rem; font-family: monospace;"></div>
      
      <div class="tool-section">
        <div class="tool-output-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h3 class="tool-section-title" style="margin: 0;">Output</h3>
        </div>
        <div class="tool-code" style="display: flex; background: var(--bg-alt); border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);">
          <div id="json-lines" class="tool-line-numbers" style="padding: 1rem 0.5rem; text-align: right; color: #888; background: rgba(0,0,0,0.05); user-select: none; font-family: 'JetBrains Mono', monospace; font-size: 14px; border-right: 1px solid var(--border-color); min-width: 40px;">1</div>
          <pre style="margin: 0; padding: 1rem; flex: 1; overflow-x: auto;"><code id="json-output" class="language-json" style="font-family: 'JetBrains Mono', monospace; font-size: 14px;"></code></pre>
        </div>
      </div>
    </div>`;
  }
  
  function init(container) {
    const input = container.querySelector('#json-input');
    const output = container.querySelector('#json-output');
    const lines = container.querySelector('#json-lines');
    const errorBox = container.querySelector('#json-error');
    
    let currentOutput = "";

    function updateOutput(text) {
      currentOutput = text;
      
      if (text === "") {
        output.innerHTML = "";
        lines.innerHTML = "1";
        return;
      }
      
      if (window.hljs) {
        const highlighted = window.hljs.highlight(text, { language: 'json' }).value;
        output.innerHTML = highlighted;
      } else {
        output.textContent = text;
      }
      
      const lineCount = text.split('\\n').length;
      lines.innerHTML = Array.from({length: lineCount}, (_, i) => i + 1).join('<br>');
    }
    
    function showError(err) {
      errorBox.style.display = 'block';
      errorBox.textContent = err.message || "Invalid JSON";
    }
    function hideError() {
      errorBox.style.display = 'none';
      errorBox.textContent = "";
    }

    container.querySelector('#json-beautify').addEventListener('click', () => {
      hideError();
      try {
        const val = input.value.trim();
        if (!val) return;
        const parsed = JSON.parse(val);
        updateOutput(JSON.stringify(parsed, null, 2));
      } catch (e) {
        showError(e);
      }
    });

    container.querySelector('#json-minify').addEventListener('click', () => {
      hideError();
      try {
        const val = input.value.trim();
        if (!val) return;
        const parsed = JSON.parse(val);
        updateOutput(JSON.stringify(parsed));
      } catch (e) {
        showError(e);
      }
    });

    container.querySelector('#json-validate').addEventListener('click', () => {
      hideError();
      try {
        const val = input.value.trim();
        if (!val) return;
        JSON.parse(val);
        if (window.DevKit) window.DevKit.showToast('Valid JSON!', 'success');
      } catch (e) {
        showError(e);
      }
    });

    container.querySelector('#json-copy').addEventListener('click', () => {
      if (currentOutput && window.DevKit) {
        window.DevKit.copyToClipboard(currentOutput);
      }
    });

    container.querySelector('#json-clear').addEventListener('click', () => {
      input.value = "";
      hideError();
      updateOutput("");
    });
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('json-formatter', {
        title: 'JSON Formatter',
        icon: 'fa-solid fa-code',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
