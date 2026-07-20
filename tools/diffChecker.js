(function() {
  'use strict';

  function diffLines(oldText, newText) {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const m = oldLines.length;
    const n = newLines.length;

    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = oldLines[i - 1] === newLines[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const result = [];
    let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        result.unshift({ type: 'same', oldLine: oldLines[i - 1], newLine: newLines[j - 1], oldNum: i, newNum: j });
        i--; j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'add', oldLine: '', newLine: newLines[j - 1], oldNum: null, newNum: j });
        j--;
      } else {
        result.unshift({ type: 'remove', oldLine: oldLines[i - 1], newLine: '', oldNum: i, newNum: null });
        i--;
      }
    }
    return result;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <div class="tool-row" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
          <div>
            <label class="tool-section-title">Original Text</label>
            <textarea id="diff-old" class="tool-textarea" style="min-height:200px;" placeholder="Paste original text..."></textarea>
          </div>
          <div>
            <label class="tool-section-title">Modified Text</label>
            <textarea id="diff-new" class="tool-textarea" style="min-height:200px;" placeholder="Paste modified text..."></textarea>
          </div>
        </div>
      </div>

      <div class="tool-btn-group">
        <button id="diff-compare" class="tool-btn primary">Compare</button>
        <button id="diff-clear" class="tool-btn danger">Clear</button>
      </div>

      <div id="diff-summary" style="font-size:0.9rem;color:var(--text-muted);margin-bottom:0.5rem;"></div>

      <div class="tool-section">
        <label class="tool-section-title">Side-by-Side Diff</label>
        <div id="diff-result" class="tool-output" style="padding:0;overflow-x:auto;font-family:'JetBrains Mono',monospace;font-size:0.85rem;">
          <span style="padding:1rem;display:block;color:var(--text-muted);">Click Compare to see differences</span>
        </div>
      </div>
    </div>`;
  }

  function renderDiff(container, diff) {
    const resultEl = container.querySelector('#diff-result');
    const summaryEl = container.querySelector('#diff-summary');

    let adds = 0, removes = 0, sames = 0;
    diff.forEach(d => {
      if (d.type === 'add') adds++;
      else if (d.type === 'remove') removes++;
      else sames++;
    });

    summaryEl.innerHTML = `<span style="color:#22c55e;">+${adds} added</span> &nbsp;|&nbsp; <span style="color:#ef4444;">-${removes} removed</span> &nbsp;|&nbsp; ${sames} unchanged`;

    let html = `<div style="display:grid;grid-template-columns:1fr 1fr;">
      <div style="border-right:1px solid var(--border);">
        <div style="padding:0.5rem 1rem;background:var(--bg-alt);font-weight:600;border-bottom:1px solid var(--border);">Original</div>`;

    diff.forEach(d => {
      const bg = d.type === 'remove' ? 'rgba(239,68,68,0.15)' : d.type === 'same' ? 'transparent' : 'rgba(239,68,68,0.05)';
      const line = d.type === 'add' ? '' : escapeHtml(d.oldLine);
      const num = d.oldNum !== null ? d.oldNum : '';
      html += `<div style="display:flex;background:${bg};border-bottom:1px solid var(--border);min-height:1.6em;">
        <span style="width:40px;padding:0 0.5rem;color:var(--text-muted);text-align:right;flex-shrink:0;border-right:1px solid var(--border);">${num}</span>
        <span style="padding:0 0.5rem;white-space:pre-wrap;word-break:break-all;flex:1;">${line || '&nbsp;'}</span>
      </div>`;
    });

    html += `</div><div>
      <div style="padding:0.5rem 1rem;background:var(--bg-alt);font-weight:600;border-bottom:1px solid var(--border);">Modified</div>`;

    diff.forEach(d => {
      const bg = d.type === 'add' ? 'rgba(34,197,94,0.15)' : d.type === 'same' ? 'transparent' : 'rgba(34,197,94,0.05)';
      const line = d.type === 'remove' ? '' : escapeHtml(d.newLine);
      const num = d.newNum !== null ? d.newNum : '';
      html += `<div style="display:flex;background:${bg};border-bottom:1px solid var(--border);min-height:1.6em;">
        <span style="width:40px;padding:0 0.5rem;color:var(--text-muted);text-align:right;flex-shrink:0;border-right:1px solid var(--border);">${num}</span>
        <span style="padding:0 0.5rem;white-space:pre-wrap;word-break:break-all;flex:1;">${line || '&nbsp;'}</span>
      </div>`;
    });

    html += '</div></div>';
    resultEl.innerHTML = html;
  }

  function init(container) {
    const oldInput = container.querySelector('#diff-old');
    const newInput = container.querySelector('#diff-new');

    function compare() {
      const diff = diffLines(oldInput.value, newInput.value);
      renderDiff(container, diff);
    }

    container.querySelector('#diff-compare').addEventListener('click', compare);

    let debounce;
    const liveCompare = () => {
      clearTimeout(debounce);
      debounce = setTimeout(compare, 300);
    };
    oldInput.addEventListener('input', liveCompare);
    newInput.addEventListener('input', liveCompare);

    container.querySelector('#diff-clear').addEventListener('click', () => {
      oldInput.value = '';
      newInput.value = '';
      container.querySelector('#diff-result').innerHTML = '<span style="padding:1rem;display:block;color:var(--text-muted);">Click Compare to see differences</span>';
      container.querySelector('#diff-summary').textContent = '';
    });
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('diff-checker', {
        title: 'Diff Checker',
        icon: 'fa-solid fa-code-compare',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
