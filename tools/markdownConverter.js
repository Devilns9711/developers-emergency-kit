(function() {
  'use strict';

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <label class="tool-section-title">Markdown Input</label>
        <textarea id="md-input" class="tool-textarea" style="min-height:180px;" placeholder="# Hello World&#10;&#10;Write **markdown** here..."></textarea>
        <div class="tool-btn-group" style="margin-top:0.75rem;">
          <button id="md-copy-html" class="tool-btn primary">Copy HTML</button>
          <button id="md-copy-md" class="tool-btn secondary">Copy Markdown</button>
          <button id="md-clear" class="tool-btn danger">Clear</button>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Live Preview</label>
        <div id="md-preview" class="tool-output md-preview-pane" style="min-height:180px;line-height:1.7;">
          <span style="color:var(--text-muted);">Preview will appear here</span>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">HTML Output</label>
        <textarea id="md-html-output" class="tool-textarea" style="min-height:120px;" readonly placeholder="Raw HTML..."></textarea>
      </div>
    </div>`;
  }

  function renderMarkdown(text) {
    if (!window.marked) return { html: '<span style="color:#ef4444;">marked.js not loaded</span>', raw: '' };
    try {
      const html = marked.parse(text);
      return { html, raw: html };
    } catch (e) {
      return { html: '<span style="color:#ef4444;">Parse error: ' + e.message + '</span>', raw: '' };
    }
  }

  function init(container) {
    const input = container.querySelector('#md-input');
    const preview = container.querySelector('#md-preview');
    const htmlOutput = container.querySelector('#md-html-output');

    const defaultMd = '# Hello World\n\nWrite **markdown** here and see the live preview.\n\n- Item one\n- Item two\n\n`inline code` and [links](https://example.com)';

    function update() {
      const text = input.value;
      if (!text) {
        preview.innerHTML = '<span style="color:var(--text-muted);">Preview will appear here</span>';
        htmlOutput.value = '';
        return;
      }
      const { html, raw } = renderMarkdown(text);
      preview.innerHTML = html;
      htmlOutput.value = raw;
    }

    input.value = defaultMd;
    input.addEventListener('input', update);
    update();

    container.querySelector('#md-copy-html').addEventListener('click', () => {
      if (htmlOutput.value && window.DevKit) window.DevKit.copyToClipboard(htmlOutput.value);
    });

    container.querySelector('#md-copy-md').addEventListener('click', () => {
      if (input.value && window.DevKit) window.DevKit.copyToClipboard(input.value);
    });

    container.querySelector('#md-clear').addEventListener('click', () => {
      input.value = '';
      update();
    });
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('markdown-converter', {
        title: 'Markdown to HTML',
        icon: 'fa-solid fa-file-lines',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
