(function() {
  'use strict';

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-tabs" style="display:flex;gap:1rem;margin-bottom:1rem;border-bottom:1px solid var(--border-color);">
        <button class="tool-tab active url-tab" data-mode="encode" style="padding:0.5rem 1rem;background:none;border:none;border-bottom:2px solid var(--primary-color);cursor:pointer;color:var(--text-color);font-weight:bold;">Encode</button>
        <button class="tool-tab url-tab" data-mode="decode" style="padding:0.5rem 1rem;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;color:var(--text-muted);">Decode</button>
      </div>

      <div class="tool-section">
        <textarea id="url-input" class="tool-textarea" style="min-height:100px;" placeholder="Enter URL or text to encode/decode..."></textarea>
        <div class="tool-btn-group" style="margin-top:0.75rem;">
          <button id="url-convert" class="tool-btn primary">Convert</button>
          <button id="url-copy" class="tool-btn secondary">Copy Output</button>
          <button id="url-clear" class="tool-btn danger">Clear</button>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Output</label>
        <textarea id="url-output" class="tool-textarea" style="min-height:80px;" readonly placeholder="Result..."></textarea>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Query Parameters Breakdown</label>
        <div id="url-params" class="tool-output" style="overflow-x:auto;">
          <span style="color:var(--text-muted);">Enter a URL with query string to see breakdown</span>
        </div>
      </div>
    </div>`;
  }

  function parseQueryParams(url) {
    try {
      const qIndex = url.indexOf('?');
      if (qIndex === -1) return null;
      const query = url.slice(qIndex + 1).split('#')[0];
      if (!query) return [];
      return query.split('&').map(pair => {
        const eq = pair.indexOf('=');
        if (eq === -1) return { key: decodeURIComponent(pair.replace(/\+/g, ' ')), value: '' };
        return {
          key: decodeURIComponent(pair.slice(0, eq).replace(/\+/g, ' ')),
          value: decodeURIComponent(pair.slice(eq + 1).replace(/\+/g, ' '))
        };
      });
    } catch {
      return null;
    }
  }

  function renderParams(container, input) {
    const paramsEl = container.querySelector('#url-params');
    const params = parseQueryParams(input);

    if (!params) {
      paramsEl.innerHTML = '<span style="color:var(--text-muted);">No query string found</span>';
      return;
    }
    if (params.length === 0) {
      paramsEl.innerHTML = '<span style="color:var(--text-muted);">Empty query string</span>';
      return;
    }

    paramsEl.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
      <thead><tr style="border-bottom:1px solid var(--border);text-align:left;">
        <th style="padding:0.5rem;">Key</th><th style="padding:0.5rem;">Value</th><th style="padding:0.5rem;">Encoded Key</th><th style="padding:0.5rem;">Encoded Value</th>
      </tr></thead>
      <tbody>${params.map(p => `<tr style="border-bottom:1px solid var(--border);">
        <td style="padding:0.5rem;font-family:monospace;">${escapeHtml(p.key)}</td>
        <td style="padding:0.5rem;font-family:monospace;">${escapeHtml(p.value)}</td>
        <td style="padding:0.5rem;font-family:monospace;color:var(--text-muted);">${escapeHtml(encodeURIComponent(p.key))}</td>
        <td style="padding:0.5rem;font-family:monospace;color:var(--text-muted);">${escapeHtml(encodeURIComponent(p.value))}</td>
      </tr>`).join('')}</tbody>
    </table>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function init(container) {
    let mode = 'encode';
    const input = container.querySelector('#url-input');
    const output = container.querySelector('#url-output');

    container.querySelectorAll('.url-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        mode = tab.dataset.mode;
        container.querySelectorAll('.url-tab').forEach(t => {
          t.classList.remove('active');
          t.style.borderBottomColor = 'transparent';
          t.style.fontWeight = 'normal';
          t.style.color = 'var(--text-muted)';
        });
        tab.classList.add('active');
        tab.style.borderBottomColor = 'var(--primary-color)';
        tab.style.fontWeight = 'bold';
        tab.style.color = 'var(--text-color)';
        convert();
      });
    });

    function convert() {
      const val = input.value;
      if (!val) { output.value = ''; renderParams(container, ''); return; }
      try {
        output.value = mode === 'encode'
          ? encodeURIComponent(val)
          : decodeURIComponent(val.replace(/\+/g, ' '));
        renderParams(container, mode === 'decode' ? val : val);
      } catch (e) {
        output.value = '';
        if (window.DevKit) window.DevKit.showToast('Invalid URL encoding', 'error');
      }
    }

    container.querySelector('#url-convert').addEventListener('click', convert);
    input.addEventListener('input', () => { convert(); });

    container.querySelector('#url-copy').addEventListener('click', () => {
      if (output.value && window.DevKit) window.DevKit.copyToClipboard(output.value);
    });

    container.querySelector('#url-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      renderParams(container, '');
    });
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('url-encoder', {
        title: 'URL Encoder/Decoder',
        icon: 'fa-solid fa-link',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
