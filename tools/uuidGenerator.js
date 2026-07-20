(function() {
  'use strict';

  function generateUUIDv4() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <div class="tool-row" style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;">
          <div class="tool-input-group" style="flex:1;min-width:140px;">
            <label>Count</label>
            <input id="uuid-count" class="tool-input" type="number" value="5" min="1" max="100">
          </div>
          <div class="tool-input-group" style="flex:1;min-width:140px;">
            <label>Format</label>
            <select id="uuid-format" class="tool-select">
              <option value="standard">Standard (lowercase)</option>
              <option value="uppercase">Uppercase</option>
              <option value="nohyphens">No hyphens</option>
            </select>
          </div>
        </div>
      </div>

      <div class="tool-btn-group">
        <button id="uuid-generate" class="tool-btn primary">Generate UUIDs</button>
        <button id="uuid-copy-all" class="tool-btn secondary">Copy All</button>
        <button id="uuid-copy-one" class="tool-btn secondary">Copy First</button>
        <button id="uuid-clear" class="tool-btn danger">Clear</button>
      </div>

      <div class="tool-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <label class="tool-section-title" style="margin:0;">Generated UUIDs</label>
          <span id="uuid-total" style="font-size:0.85rem;color:var(--text-muted);">0 UUIDs</span>
        </div>
        <textarea id="uuid-output" class="tool-textarea" style="min-height:200px;" readonly placeholder="Click Generate to create UUIDs..."></textarea>
      </div>
    </div>`;
  }

  function formatUUID(uuid, format) {
    if (format === 'uppercase') return uuid.toUpperCase();
    if (format === 'nohyphens') return uuid.replace(/-/g, '');
    return uuid;
  }

  function init(container) {
    const countInput = container.querySelector('#uuid-count');
    const formatSelect = container.querySelector('#uuid-format');
    const output = container.querySelector('#uuid-output');
    const totalEl = container.querySelector('#uuid-total');

    function generate() {
      const count = Math.min(100, Math.max(1, parseInt(countInput.value, 10) || 1));
      countInput.value = count;
      const format = formatSelect.value;
      const uuids = Array.from({ length: count }, () => formatUUID(generateUUIDv4(), format));
      output.value = uuids.join('\n');
      totalEl.textContent = count + (count === 1 ? ' UUID' : ' UUIDs');
    }

    container.querySelector('#uuid-generate').addEventListener('click', generate);
    formatSelect.addEventListener('change', () => { if (output.value) generate(); });

    container.querySelector('#uuid-copy-all').addEventListener('click', () => {
      if (output.value && window.DevKit) window.DevKit.copyToClipboard(output.value);
    });

    container.querySelector('#uuid-copy-one').addEventListener('click', () => {
      const first = output.value.split('\n')[0];
      if (first && window.DevKit) window.DevKit.copyToClipboard(first);
    });

    container.querySelector('#uuid-clear').addEventListener('click', () => {
      output.value = '';
      totalEl.textContent = '0 UUIDs';
    });

    generate();
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('uuid-generator', {
        title: 'UUID Generator',
        icon: 'fa-solid fa-fingerprint',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
