(function() {
  'use strict';

  const FIELD_NAMES = ['minute', 'hour', 'day of month', 'month', 'day of week'];
  const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const PRESETS = {
    everyMinute: '* * * * *',
    everyHour: '0 * * * *',
    daily: '0 0 * * *',
    weekly: '0 0 * * 0',
    monthly: '0 0 1 * *',
    weekdays: '0 9 * * 1-5',
    hourly: '0 * * * *'
  };

  function parseField(field, type) {
    if (field === '*') return 'every ' + type;
    if (field.startsWith('*/')) return 'every ' + field.slice(2) + ' ' + type + 's';
    if (field.includes('-') && !field.includes(',')) {
      const [a, b] = field.split('-');
      if (type === 'month') return `from ${MONTHS[parseInt(a)] || a} through ${MONTHS[parseInt(b)] || b}`;
      if (type === 'day of week') return `from ${DAYS[parseInt(a)] || a} through ${DAYS[parseInt(b)] || b}`;
      return `from ${a} through ${b}`;
    }
    if (field.includes(',')) {
      const parts = field.split(',').map(p => {
        if (type === 'month') return MONTHS[parseInt(p)] || p;
        if (type === 'day of week') return DAYS[parseInt(p)] || p;
        return p;
      });
      return 'at ' + parts.join(', ');
    }
    if (type === 'month') return 'in ' + (MONTHS[parseInt(field)] || field);
    if (type === 'day of week') return 'on ' + (DAYS[parseInt(field)] || field);
    return 'at ' + field;
  }

  function cronToHuman(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length !== 5) return { valid: false, message: 'Cron expression must have exactly 5 fields (minute hour day month weekday)' };

    const [min, hour, dom, month, dow] = parts;
    const descriptions = FIELD_NAMES.map((name, i) => {
      const field = parts[i];
      if (field === '*') return null;
      return parseField(field, name);
    }).filter(Boolean);

    let summary = 'Runs ';
    if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') {
      summary += 'every minute';
    } else if (hour === '*' && dom === '*' && month === '*' && dow === '*') {
      summary += min === '0' ? 'every hour at minute 0' : `every hour at minute ${min}`;
    } else if (dom === '*' && month === '*' && dow === '*') {
      summary += `daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    } else if (dom === '*' && month === '*' && dow !== '*') {
      const dayDesc = parseField(dow, 'day of week');
      summary += `${dayDesc} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    } else if (dom !== '*' && month === '*' && dow === '*') {
      summary += `on day ${dom} of every month at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    } else {
      summary += descriptions.length ? descriptions.join(', ') : 'on schedule';
      if (min !== '*' || hour !== '*') summary += ` at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    }

    return {
      valid: true,
      summary,
      fields: FIELD_NAMES.map((name, i) => ({ name, value: parts[i], desc: parts[i] === '*' ? 'any' : parseField(parts[i], name) }))
    };
  }

  function getContent() {
    const presetBtns = Object.entries(PRESETS).map(([key, val]) =>
      `<button class="tool-btn secondary small cron-preset" data-expr="${val}">${key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</button>`
    ).join('');

    return `<div class="tool-container">
      <div class="tool-section">
        <label class="tool-section-title">Cron Expression</label>
        <input id="cron-input" class="tool-input" type="text" value="* * * * *" placeholder="* * * * *" style="font-family:'JetBrains Mono',monospace;font-size:1.1rem;">
        <p style="font-size:0.85rem;color:var(--text-muted);margin:0.5rem 0 0;">Format: minute · hour · day · month · weekday</p>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Quick Presets</label>
        <div class="tool-btn-group">${presetBtns}</div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Human Readable</label>
        <div id="cron-human" class="tool-output" style="font-size:1.05rem;padding:1rem;min-height:48px;">
          Runs every minute
        </div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Field Breakdown</label>
        <div id="cron-fields" class="tool-output" style="overflow-x:auto;"></div>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Build Expression</label>
        <div class="tool-row" style="display:grid;grid-template-columns:repeat(5,1fr);gap:0.5rem;">
          <div class="tool-input-group"><label>Minute</label><input id="cron-min" class="tool-input" value="*" style="font-family:monospace;text-align:center;"></div>
          <div class="tool-input-group"><label>Hour</label><input id="cron-hour" class="tool-input" value="*" style="font-family:monospace;text-align:center;"></div>
          <div class="tool-input-group"><label>Day</label><input id="cron-dom" class="tool-input" value="*" style="font-family:monospace;text-align:center;"></div>
          <div class="tool-input-group"><label>Month</label><input id="cron-month" class="tool-input" value="*" style="font-family:monospace;text-align:center;"></div>
          <div class="tool-input-group"><label>Weekday</label><input id="cron-dow" class="tool-input" value="*" style="font-family:monospace;text-align:center;"></div>
        </div>
        <button id="cron-build" class="tool-btn primary" style="margin-top:0.75rem;">Apply Built Expression</button>
      </div>

      <div class="tool-section">
        <label class="tool-section-title">Reference</label>
        <div class="tool-output" style="font-size:0.85rem;line-height:1.8;">
          <code>*</code> = any &nbsp;|&nbsp; <code>*/5</code> = every 5 &nbsp;|&nbsp; <code>1-5</code> = range &nbsp;|&nbsp; <code>1,3,5</code> = list<br>
          Weekday: 0=Sun, 1=Mon, ..., 6=Sat &nbsp;|&nbsp; Month: 1=Jan, ..., 12=Dec
        </div>
      </div>
    </div>`;
  }

  function renderFields(container, fields) {
    const el = container.querySelector('#cron-fields');
    el.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
      <thead><tr style="border-bottom:1px solid var(--border);text-align:left;">
        <th style="padding:0.5rem;">Field</th><th style="padding:0.5rem;">Value</th><th style="padding:0.5rem;">Meaning</th>
      </tr></thead>
      <tbody>${fields.map(f => `<tr style="border-bottom:1px solid var(--border);">
        <td style="padding:0.5rem;font-weight:600;">${f.name}</td>
        <td style="padding:0.5rem;font-family:monospace;">${f.value}</td>
        <td style="padding:0.5rem;color:var(--text-muted);">${f.desc}</td>
      </tr>`).join('')}</tbody>
    </table>`;
  }

  function parse(container) {
    const input = container.querySelector('#cron-input');
    const humanEl = container.querySelector('#cron-human');
    const result = cronToHuman(input.value);

    if (!result.valid) {
      humanEl.innerHTML = `<span style="color:#ef4444;">${result.message}</span>`;
      container.querySelector('#cron-fields').innerHTML = '';
      return;
    }

    humanEl.textContent = result.summary;
    renderFields(container, result.fields);

    const parts = input.value.trim().split(/\s+/);
    if (parts.length === 5) {
      container.querySelector('#cron-min').value = parts[0];
      container.querySelector('#cron-hour').value = parts[1];
      container.querySelector('#cron-dom').value = parts[2];
      container.querySelector('#cron-month').value = parts[3];
      container.querySelector('#cron-dow').value = parts[4];
    }
  }

  function init(container) {
    const input = container.querySelector('#cron-input');

    input.addEventListener('input', () => parse(container));

    container.querySelectorAll('.cron-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.dataset.expr;
        parse(container);
      });
    });

    container.querySelector('#cron-build').addEventListener('click', () => {
      const expr = [
        container.querySelector('#cron-min').value || '*',
        container.querySelector('#cron-hour').value || '*',
        container.querySelector('#cron-dom').value || '*',
        container.querySelector('#cron-month').value || '*',
        container.querySelector('#cron-dow').value || '*'
      ].join(' ');
      input.value = expr;
      parse(container);
    });

    parse(container);
  }

  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('cron-tool', {
        title: 'Cron Expression Tool',
        icon: 'fa-solid fa-clock-rotate-left',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
