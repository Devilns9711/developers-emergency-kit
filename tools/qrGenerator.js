(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <div class="tool-tabs" id="qr-tabs">
          <div class="tool-tab active" data-tab="url">URL</div>
          <div class="tool-tab" data-tab="text">Text</div>
          <div class="tool-tab" data-tab="email">Email</div>
          <div class="tool-tab" data-tab="phone">Phone</div>
        </div>
        
        <div id="qr-input-container">
          <!-- Dynamically populated -->
        </div>

        <div class="tool-row" style="margin-top: 1rem;">
          <div class="tool-col">
            <label class="tool-stat"><span class="stat-label">Size</span></label>
            <select id="qr-size" class="tool-select">
              <option value="128">128x128</option>
              <option value="200">200x200</option>
              <option value="256" selected>256x256</option>
              <option value="300">300x300</option>
              <option value="400">400x400</option>
            </select>
          </div>
          <div class="tool-col">
            <label class="tool-stat"><span class="stat-label">Foreground</span></label>
            <input type="color" id="qr-fg" class="tool-input" value="#000000" style="padding: 0; height: 38px;">
          </div>
          <div class="tool-col">
            <label class="tool-stat"><span class="stat-label">Background</span></label>
            <input type="color" id="qr-bg" class="tool-input" value="#ffffff" style="padding: 0; height: 38px;">
          </div>
        </div>
        
        <div class="tool-row" style="margin-top: 1rem;">
          <button id="qr-generate" class="tool-btn primary">Generate QR Code</button>
        </div>
      </div>
      
      <div class="tool-section">
        <h3 class="tool-section-title">Result</h3>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
          <div id="qr-output" class="tool-qr-canvas" style="background: white; padding: 1rem; border-radius: 8px;"></div>
          <div class="tool-btn-group">
            <button id="qr-download" class="tool-btn secondary"><i class="fa-solid fa-download"></i> Download PNG</button>
            <button id="qr-copy" class="tool-btn secondary"><i class="fa-solid fa-copy"></i> Copy Text</button>
          </div>
        </div>
      </div>
    </div>`;
  }
  
  function init(container) {
    // Ensure QRCode library is loaded if not already
    if (typeof QRCode === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      document.head.appendChild(script);
      script.onload = () => generateQR();
    }
    
    const tabs = container.querySelectorAll('.tool-tab');
    const inputContainer = container.querySelector('#qr-input-container');
    const sizeSelect = container.querySelector('#qr-size');
    const fgColor = container.querySelector('#qr-fg');
    const bgColor = container.querySelector('#qr-bg');
    const generateBtn = container.querySelector('#qr-generate');
    const qrOutput = container.querySelector('#qr-output');
    const downloadBtn = container.querySelector('#qr-download');
    const copyBtn = container.querySelector('#qr-copy');
    
    let activeTab = 'url';
    
    function renderInput() {
      if (activeTab === 'url') {
        inputContainer.innerHTML = `<input type="url" id="qr-main-input" class="tool-input" placeholder="https://example.com" value="https://example.com">`;
      } else if (activeTab === 'text') {
        inputContainer.innerHTML = `<textarea id="qr-main-input" class="tool-textarea" placeholder="Enter your text"></textarea>`;
      } else if (activeTab === 'email') {
        inputContainer.innerHTML = `<input type="email" id="qr-main-input" class="tool-input" placeholder="user@example.com">`;
      } else if (activeTab === 'phone') {
        inputContainer.innerHTML = `<input type="tel" id="qr-main-input" class="tool-input" placeholder="+1234567890">`;
      }
    }
    
    function getInputValue() {
      const input = container.querySelector('#qr-main-input');
      if (!input) return '';
      const val = input.value.trim();
      if (!val) return '';
      
      if (activeTab === 'email') {
        return 'mailto:' + val;
      } else if (activeTab === 'phone') {
        return 'tel:' + val;
      }
      return val;
    }
    
    function getRawInputValue() {
      const input = container.querySelector('#qr-main-input');
      return input ? input.value.trim() : '';
    }
    
    function generateQR() {
      if (typeof QRCode === 'undefined') return;
      const text = getInputValue();
      if (!text) {
        if (window.DevKit) window.DevKit.showToast('Please enter some content', 'error');
        return;
      }
      
      const size = parseInt(sizeSelect.value) || 256;
      const fg = fgColor.value;
      const bg = bgColor.value;
      
      qrOutput.innerHTML = ''; // Clear previous
      
      new QRCode(qrOutput, {
        text: text,
        width: size,
        height: size,
        colorDark: fg,
        colorLight: bg,
        correctLevel: QRCode.CorrectLevel.H
      });
    }
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeTab = tab.dataset.tab;
        renderInput();
        qrOutput.innerHTML = ''; // Clear QR on tab switch
      });
    });
    
    generateBtn.addEventListener('click', generateQR);
    
    downloadBtn.addEventListener('click', () => {
      const canvas = qrOutput.querySelector('canvas');
      if (!canvas) {
        if (window.DevKit) window.DevKit.showToast('Generate a QR code first', 'error');
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    
    copyBtn.addEventListener('click', () => {
      const text = getRawInputValue();
      if (text) {
        if (window.DevKit && window.DevKit.copyToClipboard) {
          window.DevKit.copyToClipboard(text);
        } else {
          navigator.clipboard.writeText(text);
        }
      }
    });
    
    // Init
    renderInput();
    if (typeof QRCode !== 'undefined') {
      setTimeout(generateQR, 100);
    }
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('qr-generator', {
        title: 'QR Code Generator',
        icon: 'fa-solid fa-qrcode',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
