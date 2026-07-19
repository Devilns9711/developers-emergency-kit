(function() {
  'use strict';
  
  function getContent() {
    return `<div class="tool-container">
      <div class="tool-row" style="display: flex; gap: 2rem;">
        <div class="tool-col" style="flex: 1; display: flex; flex-direction: column; align-items: center;">
          <h3 class="tool-section-title">Base Color</h3>
          <input type="color" id="cp-color" class="tool-color-preview" value="#3b82f6" style="width: 150px; height: 150px; padding: 0; border: none; border-radius: 8px; cursor: pointer;">
          
          <div class="tool-btn-group" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
            <button id="cp-random" class="tool-btn secondary">Random Color</button>
            <button id="cp-fav" class="tool-btn primary"><i class="fa-regular fa-heart"></i> Favorite</button>
          </div>
        </div>
        
        <div class="tool-col" style="flex: 2;">
          <h3 class="tool-section-title">Values</h3>
          
          <div class="tool-input-group" style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;">
            <span style="width: 50px; align-self: center; font-weight: bold;">HEX</span>
            <input type="text" id="cp-hex" class="tool-input" readonly>
            <button class="tool-btn" data-copy="cp-hex"><i class="fa-regular fa-copy"></i></button>
          </div>
          
          <div class="tool-input-group" style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;">
            <span style="width: 50px; align-self: center; font-weight: bold;">RGB</span>
            <input type="text" id="cp-rgb" class="tool-input" readonly>
            <button class="tool-btn" data-copy="cp-rgb"><i class="fa-regular fa-copy"></i></button>
          </div>
          
          <div class="tool-input-group" style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;">
            <span style="width: 50px; align-self: center; font-weight: bold;">HSL</span>
            <input type="text" id="cp-hsl" class="tool-input" readonly>
            <button class="tool-btn" data-copy="cp-hsl"><i class="fa-regular fa-copy"></i></button>
          </div>
        </div>
      </div>
      
      <div class="tool-divider" style="margin: 2rem 0; border-top: 1px solid var(--border-color);"></div>
      
      <div class="tool-section">
        <h3 class="tool-section-title">Harmonious Palette (Analogous)</h3>
        <div id="cp-palette" class="tool-palette" style="display: flex; gap: 1rem; height: 80px;"></div>
      </div>
      
      <div class="tool-divider" style="margin: 2rem 0; border-top: 1px solid var(--border-color);"></div>
      
      <div class="tool-section">
        <h3 class="tool-section-title">Gradient Generator</h3>
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
          <input type="color" id="cp-grad-1" value="#3b82f6" style="width: 40px; height: 40px; padding: 0; border: none; cursor: pointer;">
          <input type="color" id="cp-grad-2" value="#8b5cf6" style="width: 40px; height: 40px; padding: 0; border: none; cursor: pointer;">
          <select id="cp-grad-dir" class="tool-select">
            <option value="to right">To Right</option>
            <option value="to bottom">To Bottom</option>
            <option value="to bottom right">To Bottom Right</option>
            <option value="to top right">To Top Right</option>
          </select>
          <button id="cp-grad-copy" class="tool-btn primary">Copy CSS</button>
        </div>
        <div id="cp-grad-preview" class="tool-gradient-preview" style="height: 100px; border-radius: 8px;"></div>
      </div>
      
      <div class="tool-divider" style="margin: 2rem 0; border-top: 1px solid var(--border-color);"></div>
      
      <div class="tool-section">
        <h3 class="tool-section-title">Favorites</h3>
        <div id="cp-favorites" class="tool-palette" style="display: flex; gap: 0.5rem; flex-wrap: wrap;"></div>
      </div>
    </div>`;
  }
  
  function init(container) {
    const cpColor = container.querySelector('#cp-color');
    const cpHex = container.querySelector('#cp-hex');
    const cpRgb = container.querySelector('#cp-rgb');
    const cpHsl = container.querySelector('#cp-hsl');
    const cpPalette = container.querySelector('#cp-palette');
    const grad1 = container.querySelector('#cp-grad-1');
    const grad2 = container.querySelector('#cp-grad-2');
    const gradDir = container.querySelector('#cp-grad-dir');
    const gradPreview = container.querySelector('#cp-grad-preview');
    const cpFavorites = container.querySelector('#cp-favorites');
    
    // Helpers
    function hexToRgb(hex) {
      const bigint = parseInt(hex.slice(1), 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if(max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }
    function hslToHex(h, s, l) {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }

    function updateColor() {
      const hex = cpColor.value;
      const rgb = hexToRgb(hex);
      const hsl = rgbToHsl(...rgb);
      
      cpHex.value = hex;
      cpRgb.value = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      cpHsl.value = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
      
      // Update palette
      cpPalette.innerHTML = '';
      for(let i = -2; i <= 2; i++) {
        const newH = (hsl[0] + i * 30 + 360) % 360;
        const cHex = hslToHex(newH, hsl[1], hsl[2]);
        const swatch = document.createElement('div');
        swatch.className = 'tool-palette-color';
        swatch.style.cssText = `flex: 1; background: ${cHex}; border-radius: 4px; cursor: pointer; transition: transform 0.2s;`;
        swatch.title = cHex;
        swatch.onclick = () => {
          if (window.DevKit) window.DevKit.copyToClipboard(cHex);
        };
        cpPalette.appendChild(swatch);
      }
    }
    
    function updateGradient() {
      const css = `linear-gradient(${gradDir.value}, ${grad1.value}, ${grad2.value})`;
      gradPreview.style.background = css;
    }

    function renderFavorites() {
      const favs = JSON.parse(sessionStorage.getItem('devkit-color-favorites') || '[]');
      cpFavorites.innerHTML = '';
      favs.forEach(hex => {
        const swatch = document.createElement('div');
        swatch.style.cssText = `width: 40px; height: 40px; background: ${hex}; border-radius: 4px; cursor: pointer; border: 1px solid var(--border-color);`;
        swatch.title = hex;
        swatch.onclick = () => {
          if (window.DevKit) window.DevKit.copyToClipboard(hex);
        };
        cpFavorites.appendChild(swatch);
      });
    }

    cpColor.addEventListener('input', updateColor);
    grad1.addEventListener('input', updateGradient);
    grad2.addEventListener('input', updateGradient);
    gradDir.addEventListener('change', updateGradient);

    container.querySelector('#cp-random').addEventListener('click', () => {
      const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      cpColor.value = randomHex;
      updateColor();
    });

    container.querySelector('#cp-fav').addEventListener('click', () => {
      const favs = JSON.parse(sessionStorage.getItem('devkit-color-favorites') || '[]');
      if (!favs.includes(cpColor.value)) {
        favs.push(cpColor.value);
        sessionStorage.setItem('devkit-color-favorites', JSON.stringify(favs));
        renderFavorites();
      }
    });
    
    container.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.copy;
        const input = container.querySelector('#' + targetId);
        if (input && window.DevKit) {
          window.DevKit.copyToClipboard(input.value);
        }
      });
    });

    container.querySelector('#cp-grad-copy').addEventListener('click', () => {
      const css = `linear-gradient(${gradDir.value}, ${grad1.value}, ${grad2.value})`;
      if (window.DevKit) window.DevKit.copyToClipboard(css);
    });

    updateColor();
    updateGradient();
    renderFavorites();
  }
  
  function register() {
    if (window.DevKit && window.DevKit.registerTool) {
      window.DevKit.registerTool('color-picker', {
        title: 'Color Picker',
        icon: 'fa-solid fa-palette',
        getContent,
        init
      });
    } else {
      document.addEventListener('devkit-ready', register);
    }
  }
  register();
})();
