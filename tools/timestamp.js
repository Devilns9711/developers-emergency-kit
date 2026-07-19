(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <div class="tool-live-clock" style="text-align: center; margin-bottom: 1rem;">
          <h2 id="ts-live-clock" style="font-size: 2rem; margin: 0; color: var(--accent);">--:--:--</h2>
          <div id="ts-live-date" style="color: var(--text-muted);">--</div>
        </div>
        
        <div class="tool-row" style="justify-content: center; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <label class="tool-stat"><span class="stat-label" style="margin:0;">Current Unix Timestamp:</span></label>
          <code id="ts-current" class="tool-code" style="font-size: 1.2rem; padding: 0.5rem 1rem;">0</code>
          <button id="ts-copy-current" class="tool-btn small"><i class="fa-solid fa-copy"></i></button>
        </div>
      </div>
      
      <div class="tool-divider" style="height: 1px; background: var(--border); margin: 1.5rem 0;"></div>
      
      <div class="tool-row" style="align-items: flex-start;">
        <div class="tool-col" style="flex: 1; padding: 1rem; border: 1px solid var(--border); border-radius: 8px;">
          <h3 class="tool-section-title">Unix Timestamp to Date</h3>
          <div class="tool-input-group" style="display: flex; gap: 0.5rem;">
            <input type="number" id="ts-unix-input" class="tool-input" placeholder="e.g. 1700000000">
            <button id="ts-btn-unix" class="tool-btn primary">Convert</button>
          </div>
          <div style="margin-top: 1rem; min-height: 40px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px;">
            <span id="ts-unix-output">Result here</span>
            <button id="ts-copy-unix-out" class="tool-btn small"><i class="fa-solid fa-copy"></i></button>
          </div>
        </div>
        
        <div class="tool-col" style="flex: 1; padding: 1rem; border: 1px solid var(--border); border-radius: 8px;">
          <h3 class="tool-section-title">Date to Unix Timestamp</h3>
          <div class="tool-input-group" style="display: flex; gap: 0.5rem;">
            <input type="datetime-local" id="ts-date-input" class="tool-input">
            <button id="ts-btn-date" class="tool-btn primary">Convert</button>
          </div>
          <div style="margin-top: 1rem; min-height: 40px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-tertiary); padding: 0.5rem; border-radius: 4px;">
            <span id="ts-date-output">Result here</span>
            <button id="ts-copy-date-out" class="tool-btn small"><i class="fa-solid fa-copy"></i></button>
          </div>
        </div>
      </div>
      
      <div class="tool-divider" style="height: 1px; background: var(--border); margin: 1.5rem 0;"></div>
      
      <div class="tool-section">
        <h3 class="tool-section-title">Timezone Viewer</h3>
        <div class="tool-row" style="align-items: center;">
          <div class="tool-col" style="flex: 1;">
            <select id="ts-tz-select" class="tool-select">
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (Eastern)</option>
              <option value="America/Chicago">America/Chicago (Central)</option>
              <option value="America/Denver">America/Denver (Mountain)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </select>
          </div>
          <div class="tool-col" style="flex: 2;">
            <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-tertiary); padding: 0.75rem; border-radius: 4px;">
              <span id="ts-tz-output" style="font-weight: 500;">--</span>
              <button id="ts-copy-tz" class="tool-btn small"><i class="fa-solid fa-copy"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  function init(container) {
    const liveClock = container.querySelector('#ts-live-clock');
    const liveDate = container.querySelector('#ts-live-date');
    const currentTs = container.querySelector('#ts-current');
    const copyCurrentBtn = container.querySelector('#ts-copy-current');
    
    const unixInput = container.querySelector('#ts-unix-input');
    const btnUnix = container.querySelector('#ts-btn-unix');
    const unixOutput = container.querySelector('#ts-unix-output');
    const copyUnixBtn = container.querySelector('#ts-copy-unix-out');
    
    const dateInput = container.querySelector('#ts-date-input');
    const btnDate = container.querySelector('#ts-btn-date');
    const dateOutput = container.querySelector('#ts-date-output');
    const copyDateBtn = container.querySelector('#ts-copy-date-out');
    
    const tzSelect = container.querySelector('#ts-tz-select');
    const tzOutput = container.querySelector('#ts-tz-output');
    const copyTzBtn = container.querySelector('#ts-copy-tz');
    
    // Clear any previous interval if stored
    if (container.dataset.clockInterval) {
      clearInterval(Number(container.dataset.clockInterval));
    }
    
    function updateLiveClock() {
      const now = new Date();
      liveClock.textContent = now.toLocaleTimeString('en-US');
      liveDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      currentTs.textContent = Math.floor(now.getTime() / 1000);
      updateTzTime();
    }
    
    function updateTzTime() {
      const tz = tzSelect.value;
      const now = new Date();
      try {
        tzOutput.textContent = now.toLocaleString('en-US', { 
          timeZone: tz, 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          timeZoneName: 'short'
        });
      } catch (e) {
        tzOutput.textContent = 'Invalid Timezone';
      }
    }
    
    const clockInterval = setInterval(updateLiveClock, 1000);
    container.dataset.clockInterval = clockInterval; // Store for cleanup
    updateLiveClock(); // initial call
    
    btnUnix.addEventListener('click', () => {
      const val = parseInt(unixInput.value);
      if (!isNaN(val)) {
        const d = new Date(val * 1000);
        unixOutput.textContent = d.toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short'
        });
      } else {
        unixOutput.textContent = 'Invalid Timestamp';
      }
    });
    
    btnDate.addEventListener('click', () => {
      const val = dateInput.value;
      if (val) {
        const ts = Math.floor(new Date(val).getTime() / 1000);
        dateOutput.textContent = ts;
      } else {
        dateOutput.textContent = 'Invalid Date';
      }
    });
    
    tzSelect.addEventListener('change', updateTzTime);
    
    // Copy handlers
    function setupCopy(btn, targetEl) {
      btn.addEventListener('click', () => {
        const text = targetEl.textContent;
        if (text && text !== 'Result here' && text !== '--') {
          if (window.DevKit && window.DevKit.copyToClipboard) {
            window.DevKit.copyToClipboard(text);
          } else {
            navigator.clipboard.writeText(text);
          }
        }
      });
    }
    
    setupCopy(copyCurrentBtn, currentTs);
    setupCopy(copyUnixBtn, unixOutput);
    setupCopy(copyDateBtn, dateOutput);
    setupCopy(copyTzBtn, tzOutput);
    
    // Cleanup when modal closes (using MutationObserver to check if container is removed)
    const observer = new MutationObserver((mutations) => {
      if (!document.body.contains(container)) {
        clearInterval(clockInterval);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('timestamp-converter', {
        title: 'Timestamp Converter',
        icon: 'fa-solid fa-clock',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
