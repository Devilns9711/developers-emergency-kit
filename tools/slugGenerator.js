(function() {
  'use strict';

  function slugify(text, options) {
    let slug = text.trim().toLowerCase();

    if (options.transliterate !== false) {
      slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    slug = slug
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, options.separator || '-')
      .replace(new RegExp(`${(options.separator || '-').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+`, 'g'), options.separator || '-')
      .replace(new RegExp(`^${(options.separator || '-').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${(options.separator || '-').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'g'), '');

    if (options.maxLength && slug.length > options.maxLength) {
      slug = slug.slice(0, options.maxLength).replace(/-+$/, '');
    }

    return slug;
  }

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <label class="tool-section-title">Input Text</label>
        <input id="slug-input" class="tool-input" type="text" placeholder='e.g. "My Blog Post"' style="font-size:1.1rem;">
      </div>

      <div class="tool-section">
        <div class="tool-row" style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end;">
          <div class="tool-input-group" style="flex:1;min-width:120px;">
            <label>Separator</label>
            <select id="slug-separator" class="tool-select">
              <option value="-">Hyphen (-)</option>
              <option value="_">Underscore (_)</option>
              <option value=".">Dot (.)</option>
            </select>
          </div>
          <div class="tool-input-group" style="flex:1;min-width:120px;">
            <label>Max Length</label>
            <input id="slug-maxlen" class="tool-input" type="number" placeholder="No limit" min="1">
          </div>
          <div class="tool-checkbox-group" style="align-self:center;">
            <label><input type="checkbox" id="slug-transliterate" checked> Remove accents</label>
          </div>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Generated Slug</label>
        <div id="slug-output" class="tool-output" style="font-family:'JetBrains Mono',monospace;font-size:1.2rem;padding:1rem;min-height:48px;">
          <span style="color:var(--text-muted);">Slug will appear here</span>
        </div>
        <div class="tool-btn-group" style="margin-top:0.75rem;">
          <button id="slug-copy" class="tool-btn primary">Copy Slug</button>
          <button id="slug-clear" class="tool-btn danger">Clear</button>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Examples</label>
        <div class="tool-btn-group">
          <button class="tool-btn secondary small slug-example" data-text="My Blog Post">My Blog Post</button>
          <button class="tool-btn secondary small slug-example" data-text="Hello World! 2024">Hello World! 2024</button>
          <button class="tool-btn secondary small slug-example" data-text="Café & Résumé Tips">Café & Résumé Tips</button>
          <button class="tool-btn secondary small slug-example" data-text="  Trim   Spaces  ">Trim Spaces</button>
        </div>
      </div>
    </div>`;
  }

  function init(container) {
    const input = container.querySelector('#slug-input');
    const output = container.querySelector('#slug-output');
    const separator = container.querySelector('#slug-separator');
    const maxLen = container.querySelector('#slug-maxlen');
    const transliterate = container.querySelector('#slug-transliterate');

    function generate() {
      const text = input.value;
      if (!text.trim()) {
        output.innerHTML = '<span style="color:var(--text-muted);">Slug will appear here</span>';
        return;
      }
      const opts = {
        separator: separator.value,
        transliterate: transliterate.checked,
        maxLength: maxLen.value ? parseInt(maxLen.value, 10) : null
      };
      const slug = slugify(text, opts);
      output.textContent = slug || '(empty slug)';
    }

    input.addEventListener('input', generate);
    separator.addEventListener('change', generate);
    maxLen.addEventListener('input', generate);
    transliterate.addEventListener('change', generate);

    container.querySelector('#slug-copy').addEventListener('click', () => {
      const text = output.textContent;
      if (text && !text.includes('appear here') && text !== '(empty slug)' && window.DevKit) {
        window.DevKit.copyToClipboard(text);
      }
    });

    container.querySelector('#slug-clear').addEventListener('click', () => {
      input.value = '';
      generate();
    });

    container.querySelectorAll('.slug-example').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.text;
        generate();
      });
    });

    input.value = 'My Blog Post';
    generate();
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('slug-generator', {
        title: 'Slug Generator',
        icon: 'fa-solid fa-link-slash',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
