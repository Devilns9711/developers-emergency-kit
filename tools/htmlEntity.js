(function() {
  'use strict';

  const ENTITY_MAP = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
  };

  const NAMED_ENTITIES = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
    '&apos;': "'", '&nbsp;': '\u00A0', '&copy;': '©', '&reg;': '®',
    '&trade;': '™', '&euro;': '€', '&pound;': '£', '&yen;': '¥',
    '&cent;': '¢', '&sect;': '§', '&deg;': '°', '&plusmn;': '±',
    '&times;': '×', '&divide;': '÷', '&hellip;': '…', '&mdash;': '—',
    '&ndash;': '–', '&laquo;': '«', '&raquo;': '»'
  };

  function encodeHtml(str) {
    return str.replace(/[&<>"'`=\/]/g, c => ENTITY_MAP[c] || c);
  }

  function decodeHtml(str) {
    return str
      .replace(/&[#\w]+;/g, entity => {
        if (NAMED_ENTITIES[entity]) return NAMED_ENTITIES[entity];
        if (entity.startsWith('&#x')) return String.fromCharCode(parseInt(entity.slice(3, -1), 16));
        if (entity.startsWith('&#')) return String.fromCharCode(parseInt(entity.slice(2, -1), 10));
        return entity;
      });
  }

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-tabs" style="display:flex;gap:1rem;margin-bottom:1rem;border-bottom:1px solid var(--border-color);">
        <button class="tool-tab active html-tab" data-mode="encode" style="padding:0.5rem 1rem;background:none;border:none;border-bottom:2px solid var(--primary-color);cursor:pointer;color:var(--text-color);font-weight:bold;">Encode</button>
        <button class="tool-tab html-tab" data-mode="decode" style="padding:0.5rem 1rem;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;color:var(--text-muted);">Decode</button>
      </div>

      <div class="tool-section">
        <textarea id="html-input" class="tool-textarea" style="min-height:120px;" placeholder="Enter text with <tags> or &amp; entities..."></textarea>
        <div class="tool-btn-group" style="margin-top:0.75rem;">
          <button id="html-convert" class="tool-btn primary">Convert</button>
          <button id="html-copy" class="tool-btn secondary">Copy Output</button>
          <button id="html-clear" class="tool-btn danger">Clear</button>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Output</label>
        <textarea id="html-output" class="tool-textarea" style="min-height:120px;" readonly placeholder="Result..."></textarea>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Preview</label>
        <div id="html-preview" class="tool-output" style="min-height:60px;"></div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Common Entities Reference</label>
        <div class="tool-output" style="font-family:'JetBrains Mono',monospace;font-size:0.85rem;line-height:1.8;">
          &lt; → &amp;lt; &nbsp;|&nbsp; &gt; → &amp;gt; &nbsp;|&nbsp; &amp; → &amp;amp; &nbsp;|&nbsp; " → &amp;quot; &nbsp;|&nbsp; ' → &amp;#39;
        </div>
      </div>
    </div>`;
  }

  function init(container) {
    let mode = 'encode';
    const input = container.querySelector('#html-input');
    const output = container.querySelector('#html-output');
    const preview = container.querySelector('#html-preview');

    container.querySelectorAll('.html-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        mode = tab.dataset.mode;
        container.querySelectorAll('.html-tab').forEach(t => {
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
      if (!val) {
        output.value = '';
        preview.textContent = '';
        return;
      }
      if (mode === 'encode') {
        output.value = encodeHtml(val);
        preview.textContent = val;
      } else {
        output.value = decodeHtml(val);
        preview.innerHTML = decodeHtml(val);
      }
    }

    container.querySelector('#html-convert').addEventListener('click', convert);
    input.addEventListener('input', convert);

    container.querySelector('#html-copy').addEventListener('click', () => {
      if (output.value && window.DevKit) window.DevKit.copyToClipboard(output.value);
    });

    container.querySelector('#html-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
      preview.textContent = '';
    });
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('html-entity', {
        title: 'HTML Entity Encoder/Decoder',
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
