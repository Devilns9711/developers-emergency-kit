(function() {
  'use strict';

  const PATTERNS = {
    email: { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
    phone: { label: 'Phone (US)', pattern: '\\+?1?[-.\\s]?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', flags: 'g' },
    url: { label: 'URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+', flags: 'gi' },
    ipv4: { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
    date: { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
    hex: { label: 'Hex Color', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'g' }
  };

  function getContent() {
    const patternBtns = Object.entries(PATTERNS).map(([key, p]) =>
      `<button class="tool-btn secondary small regex-pattern-btn" data-pattern="${key}">${p.label}</button>`
    ).join('');

    return `<div class="tool-container">
      <div class="tool-section">
        <div class="tool-row" style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:flex-end;">
          <div class="tool-input-group" style="flex:2;min-width:200px;">
            <label>Regular Expression</label>
            <input id="regex-pattern" class="tool-input" type="text" placeholder="e.g. \\d{3}-\\d{2}-\\d{4}" style="font-family:'JetBrains Mono',monospace;">
          </div>
          <div class="tool-input-group" style="flex:0 0 120px;">
            <label>Flags</label>
            <input id="regex-flags" class="tool-input" type="text" value="g" maxlength="6" style="font-family:'JetBrains Mono',monospace;">
          </div>
        </div>
        <div class="tool-checkbox-group">
          <label><input type="checkbox" id="regex-flag-g" checked> g (global)</label>
          <label><input type="checkbox" id="regex-flag-i"> i (ignore case)</label>
          <label><input type="checkbox" id="regex-flag-m"> m (multiline)</label>
          <label><input type="checkbox" id="regex-flag-s"> s (dotall)</label>
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Common Patterns</label>
        <div class="tool-btn-group">${patternBtns}</div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Test String</label>
        <textarea id="regex-test" class="tool-textarea" style="min-height:120px;" placeholder="Enter text to test against the regex..."></textarea>
      </div>

      <div id="regex-error" class="tool-error" style="display:none;padding:0.75rem;border-radius:4px;background:rgba(239,68,68,0.1);color:#ef4444;font-family:monospace;"></div>

      <div class="tool-section">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <label class="tool-section-title" style="margin:0;">Highlighted Matches</label>
          <span id="regex-match-count" style="font-size:0.85rem;color:var(--text-muted);">0 matches</span>
        </div>
        <div id="regex-highlight" class="tool-output" style="min-height:80px;font-family:'JetBrains Mono',monospace;font-size:0.9rem;white-space:pre-wrap;word-break:break-word;line-height:1.6;"></div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Match Details</label>
        <div id="regex-matches" class="tool-output" style="max-height:200px;overflow-y:auto;font-family:'JetBrains Mono',monospace;font-size:0.85rem;">
          <span style="color:var(--text-muted);">No matches yet</span>
        </div>
      </div>
    </div>`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getFlags(container) {
    let flags = '';
    if (container.querySelector('#regex-flag-g').checked) flags += 'g';
    if (container.querySelector('#regex-flag-i').checked) flags += 'i';
    if (container.querySelector('#regex-flag-m').checked) flags += 'm';
    if (container.querySelector('#regex-flag-s').checked) flags += 's';
    container.querySelector('#regex-flags').value = flags;
    return flags;
  }

  function syncFlagCheckboxes(container, flags) {
    container.querySelector('#regex-flag-g').checked = flags.includes('g');
    container.querySelector('#regex-flag-i').checked = flags.includes('i');
    container.querySelector('#regex-flag-m').checked = flags.includes('m');
    container.querySelector('#regex-flag-s').checked = flags.includes('s');
  }

  function runTest(container) {
    const patternInput = container.querySelector('#regex-pattern');
    const testInput = container.querySelector('#regex-test');
    const highlightEl = container.querySelector('#regex-highlight');
    const matchesEl = container.querySelector('#regex-matches');
    const countEl = container.querySelector('#regex-match-count');
    const errorEl = container.querySelector('#regex-error');

    const pattern = patternInput.value;
    const text = testInput.value;
    const flags = getFlags(container);

    errorEl.style.display = 'none';

    if (!pattern) {
      highlightEl.innerHTML = text ? escapeHtml(text) : '<span style="color:var(--text-muted);">Enter a regex pattern above</span>';
      matchesEl.innerHTML = '<span style="color:var(--text-muted);">No matches yet</span>';
      countEl.textContent = '0 matches';
      return;
    }

    let regex;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      errorEl.style.display = 'block';
      errorEl.textContent = 'Invalid regex: ' + e.message;
      highlightEl.innerHTML = text ? escapeHtml(text) : '';
      matchesEl.innerHTML = '<span style="color:#ef4444;">Invalid pattern</span>';
      countEl.textContent = 'Error';
      return;
    }

    const matches = [];
    if (flags.includes('g')) {
      let m;
      const re = new RegExp(pattern, flags);
      while ((m = re.exec(text)) !== null) {
        matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (m[0].length === 0) re.lastIndex++;
      }
    } else {
      const m = regex.exec(text);
      if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
    }

    let html = '';
    let lastIndex = 0;
    const sorted = [...matches].sort((a, b) => a.index - b.index);

    sorted.forEach(({ match, index }) => {
      html += escapeHtml(text.slice(lastIndex, index));
      html += `<mark style="background:rgba(59,130,246,0.35);color:inherit;border-radius:2px;padding:0 1px;">${escapeHtml(match)}</mark>`;
      lastIndex = index + match.length;
    });
    html += escapeHtml(text.slice(lastIndex));

    highlightEl.innerHTML = html || '<span style="color:var(--text-muted);">No text to highlight</span>';
    countEl.textContent = matches.length + (matches.length === 1 ? ' match' : ' matches');

    if (matches.length === 0) {
      matchesEl.innerHTML = '<span style="color:var(--text-muted);">No matches found</span>';
    } else {
      matchesEl.innerHTML = matches.map((m, i) =>
        `<div style="padding:0.4rem 0;border-bottom:1px solid var(--border);">
          <strong>#${i + 1}</strong> "${escapeHtml(m.match)}" at index ${m.index}
          ${m.groups.length ? `<br><span style="color:var(--text-muted);">Groups: ${m.groups.map(g => '"' + escapeHtml(g || '') + '"').join(', ')}</span>` : ''}
        </div>`
      ).join('');
    }
  }

  function init(container) {
    const patternInput = container.querySelector('#regex-pattern');
    const testInput = container.querySelector('#regex-test');
    const flagsInput = container.querySelector('#regex-flags');

    const debouncedRun = (() => {
      let t;
      return () => { clearTimeout(t); t = setTimeout(() => runTest(container), 150); };
    })();

    patternInput.addEventListener('input', debouncedRun);
    testInput.addEventListener('input', debouncedRun);

    container.querySelectorAll('[id^="regex-flag-"]').forEach(cb => {
      cb.addEventListener('change', () => runTest(container));
    });

    flagsInput.addEventListener('input', () => {
      syncFlagCheckboxes(container, flagsInput.value);
      runTest(container);
    });

    container.querySelectorAll('.regex-pattern-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = PATTERNS[btn.dataset.pattern];
        if (!p) return;
        patternInput.value = p.pattern;
        flagsInput.value = p.flags;
        syncFlagCheckboxes(container, p.flags);
        runTest(container);
      });
    });

    runTest(container);
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('regex-tester', {
        title: 'Regex Tester',
        icon: 'fa-solid fa-magnifying-glass',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
