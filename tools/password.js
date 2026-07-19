(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-section">
        <h3 class="tool-section-title">Password Length: <span id="pwd-len-display">16</span></h3>
        <input type="range" id="pwd-length" class="tool-range" min="8" max="128" value="16">
      </div>
      
      <div class="tool-section">
        <h3 class="tool-section-title">Options</h3>
        <div class="tool-checkbox-group">
          <label><input type="checkbox" id="pwd-upper" checked> Uppercase (A-Z)</label>
          <label><input type="checkbox" id="pwd-lower" checked> Lowercase (a-z)</label>
          <label><input type="checkbox" id="pwd-nums" checked> Numbers (0-9)</label>
          <label><input type="checkbox" id="pwd-syms"> Symbols (!@#$)</label>
          <label><input type="checkbox" id="pwd-exclude"> Exclude Similar (i/l/1/L/o/0/O)</label>
        </div>
      </div>
      
      <div class="tool-section">
        <button id="pwd-generate" class="tool-btn primary">Generate Password</button>
      </div>
      
      <div class="tool-section">
        <div class="tool-output-header">
          <h3 class="tool-section-title">Generated Password</h3>
          <button id="pwd-copy" class="copy-btn"><i class="fa-regular fa-copy"></i> Copy</button>
        </div>
        <div id="pwd-output" class="tool-output tool-code" style="font-family: monospace; font-size: 1.2rem; word-break: break-all;"></div>
      </div>
      
      <div class="tool-section">
        <div class="tool-strength-meter">
          <div id="pwd-strength-bar" class="tool-strength-bar" style="width: 0%; background: #ccc; height: 8px; border-radius: 4px; transition: all 0.3s;"></div>
          <div id="pwd-strength-label" style="margin-top: 5px; font-weight: bold;"></div>
        </div>
      </div>
    </div>`;
  }
  
  function init(container) {
    const lenInput = container.querySelector('#pwd-length');
    const lenDisplay = container.querySelector('#pwd-len-display');
    const upperCb = container.querySelector('#pwd-upper');
    const lowerCb = container.querySelector('#pwd-lower');
    const numsCb = container.querySelector('#pwd-nums');
    const symsCb = container.querySelector('#pwd-syms');
    const excCb = container.querySelector('#pwd-exclude');
    const genBtn = container.querySelector('#pwd-generate');
    const copyBtn = container.querySelector('#pwd-copy');
    const output = container.querySelector('#pwd-output');
    const strengthBar = container.querySelector('#pwd-strength-bar');
    const strengthLabel = container.querySelector('#pwd-strength-label');

    const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowers = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const similar = "il1Lo0O";

    function generate() {
      const length = parseInt(lenInput.value, 10);
      let charset = "";
      
      if (upperCb.checked) charset += uppers;
      if (lowerCb.checked) charset += lowers;
      if (numsCb.checked) charset += numbers;
      if (symsCb.checked) charset += symbols;
      
      if (excCb.checked) {
        charset = charset.split('').filter(c => !similar.includes(c)).join('');
      }
      
      if (charset.length === 0) {
        output.textContent = "Please select at least one character set.";
        strengthBar.style.width = '0%';
        strengthLabel.textContent = '';
        return;
      }
      
      let password = "";
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      
      for (let i = 0; i < length; i++) {
        password += charset[array[i] % charset.length];
      }
      
      output.textContent = password;
      updateStrength(length, charset.length);
    }
    
    function updateStrength(len, charsetSize) {
      if (charsetSize === 0) return;
      const entropy = len * Math.log2(charsetSize);
      let color, label, width;
      
      if (entropy < 40) {
        color = '#ef4444'; label = 'Weak'; width = '25%';
      } else if (entropy < 60) {
        color = '#f97316'; label = 'Fair'; width = '50%';
      } else if (entropy < 80) {
        color = '#eab308'; label = 'Strong'; width = '75%';
      } else {
        color = '#22c55e'; label = 'Very Strong'; width = '100%';
      }
      
      strengthBar.style.width = width;
      strengthBar.style.background = color;
      strengthLabel.textContent = label;
      strengthLabel.style.color = color;
    }
    
    const inputs = [lenInput, upperCb, lowerCb, numsCb, symsCb, excCb];
    inputs.forEach(el => el.addEventListener('input', () => {
      if (el === lenInput) lenDisplay.textContent = el.value;
      generate();
    }));
    
    genBtn.addEventListener('click', generate);
    copyBtn.addEventListener('click', () => {
      if (output.textContent && window.DevKit) {
        window.DevKit.copyToClipboard(output.textContent);
      }
    });

    generate();
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('password-generator', {
        title: 'Password Generator',
        icon: 'fa-solid fa-key',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
