(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-tabs" style="display: flex; gap: 1rem; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
        <button class="tool-tab active" data-target="b64-text-tab" style="padding: 0.5rem 1rem; background: none; border: none; border-bottom: 2px solid var(--primary-color); cursor: pointer; color: var(--text-color); font-weight: bold;">Text</button>
        <button class="tool-tab" data-target="b64-file-tab" style="padding: 0.5rem 1rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; color: var(--text-muted);">File</button>
      </div>
      
      <div id="b64-text-tab" class="tool-tab-content">
        <textarea id="b64-input" class="tool-textarea" style="min-height: 120px;" placeholder="Enter text here..."></textarea>
        
        <div class="tool-btn-group" style="margin: 1rem 0; display: flex; gap: 0.5rem;">
          <button id="b64-encode" class="tool-btn primary">Encode</button>
          <button id="b64-decode" class="tool-btn secondary">Decode</button>
          <button id="b64-copy-txt" class="tool-btn secondary">Copy</button>
          <button id="b64-clear" class="tool-btn danger">Clear</button>
        </div>
        
        <textarea id="b64-output" class="tool-textarea" style="min-height: 120px;" readonly placeholder="Output..."></textarea>
      </div>
      
      <div id="b64-file-tab" class="tool-tab-content" style="display: none;">
        <div id="b64-drop-zone" class="tool-file-input" style="border: 2px dashed var(--border-color); padding: 2rem; text-align: center; border-radius: 8px; cursor: pointer; transition: all 0.3s; margin-bottom: 1rem;">
          <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary-color);"></i>
          <p>Click or drag a file here</p>
        </div>
        <input type="file" id="b64-file-input" style="display: none;">
        
        <div id="b64-file-preview-container" style="display: none; margin-bottom: 1rem; text-align: center;">
          <img id="b64-image-preview" class="tool-image-preview" style="max-width: 100%; max-height: 200px; border-radius: 8px; display: none;">
        </div>
        
        <textarea id="b64-file-output" class="tool-textarea" style="min-height: 150px; font-family: monospace;" readonly placeholder="Base64 output will appear here..."></textarea>
        <button id="b64-copy-file" class="tool-btn secondary" style="margin-top: 1rem;">Copy Base64</button>
      </div>
    </div>`;
  }
  
  function init(container) {
    // Tabs
    const tabs = container.querySelectorAll('.tool-tab');
    const tabContents = container.querySelectorAll('.tool-tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.style.borderBottomColor = 'transparent';
          t.style.fontWeight = 'normal';
          t.style.color = 'var(--text-muted)';
        });
        tab.classList.add('active');
        tab.style.borderBottomColor = 'var(--primary-color)';
        tab.style.fontWeight = 'bold';
        tab.style.color = 'var(--text-color)';
        
        tabContents.forEach(tc => tc.style.display = 'none');
        container.querySelector('#' + tab.dataset.target).style.display = 'block';
      });
    });
    
    // Text Tab
    const txtInput = container.querySelector('#b64-input');
    const txtOutput = container.querySelector('#b64-output');
    
    container.querySelector('#b64-encode').addEventListener('click', () => {
      try {
        txtOutput.value = btoa(unescape(encodeURIComponent(txtInput.value)));
      } catch(e) {
        if (window.DevKit) window.DevKit.showToast('Encoding error', 'error');
      }
    });
    
    container.querySelector('#b64-decode').addEventListener('click', () => {
      try {
        txtOutput.value = decodeURIComponent(escape(atob(txtInput.value)));
      } catch(e) {
        if (window.DevKit) window.DevKit.showToast('Decoding error. Invalid Base64', 'error');
      }
    });
    
    container.querySelector('#b64-copy-txt').addEventListener('click', () => {
      if (txtOutput.value && window.DevKit) {
        window.DevKit.copyToClipboard(txtOutput.value);
      }
    });
    
    container.querySelector('#b64-clear').addEventListener('click', () => {
      txtInput.value = '';
      txtOutput.value = '';
    });
    
    // File Tab
    const dropZone = container.querySelector('#b64-drop-zone');
    const fileInput = container.querySelector('#b64-file-input');
    const fileOutput = container.querySelector('#b64-file-output');
    const previewContainer = container.querySelector('#b64-file-preview-container');
    const imgPreview = container.querySelector('#b64-image-preview');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--primary-color)';
      dropZone.style.background = 'rgba(59, 130, 246, 0.1)';
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = 'var(--border-color)';
      dropZone.style.background = 'none';
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--border-color)';
      dropZone.style.background = 'none';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0]);
      }
    });
    
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        processFile(e.target.files[0]);
      }
    });
    
    function processFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        fileOutput.value = result;
        
        if (result.startsWith('data:image/')) {
          imgPreview.src = result;
          imgPreview.style.display = 'inline-block';
          previewContainer.style.display = 'block';
        } else {
          imgPreview.style.display = 'none';
          previewContainer.style.display = 'none';
        }
      };
      reader.readAsDataURL(file);
    }
    
    container.querySelector('#b64-copy-file').addEventListener('click', () => {
      if (fileOutput.value && window.DevKit) {
        window.DevKit.copyToClipboard(fileOutput.value);
      }
    });
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('base64-tool', {
        title: 'Base64 Converter',
        icon: 'fa-solid fa-file-code',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
