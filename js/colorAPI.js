// --- Color API Integration ---
const hexInput = document.getElementById('hexInput');
const fetchColorBtn = document.getElementById('fetchColorBtn');
const modeSelect = document.getElementById('modeSelect');
const colorInfo = document.getElementById('colorInfo');
const paletteGrid = document.getElementById('paletteGrid');
const colorPicker = document.getElementById('colorPicker');

if (hexInput && fetchColorBtn && modeSelect && colorPicker) {
  const tidyHex = (s) => s.replace('#','').trim().toUpperCase();
  const randomHex = () => Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
  const isDark = (hex) => {
    const n = parseInt(hex, 16);
    const r = (n>>16)&255, g = (n>>8)&255, b = n&255;
    const L = 0.2126*(r/255)+0.7152*(g/255)+0.0722*(b/255);
    return L < 0.55;
  };

  function pickColor(hex) {
    colorPicker.value = hex;                         // "#RRGGBB"
    colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
  }

  async function loadColor(hex, mode = 'analogic') {
    const clean = tidyHex(hex);
    if (!/^[0-9A-F]{6}$/.test(clean)) { alert('Ungültige HEX-Farbe.'); return; }

    const idUrl = `https://www.thecolorapi.com/id?hex=${clean}`;
    const schemeUrl = `https://www.thecolorapi.com/scheme?hex=${clean}&mode=${encodeURIComponent(mode)}&count=5`;

    try {
      const [idRes, schemeRes] = await Promise.all([
        fetch(idUrl, { headers: { 'Accept': 'application/json' } }),
        fetch(schemeUrl, { headers: { 'Accept': 'application/json' } })
      ]);
      if (!idRes.ok || !schemeRes.ok) throw new Error('API error');

      const colorData = await idRes.json();
      const schemeData = await schemeRes.json();

      const hexVal = colorData?.hex?.value || ('#' + clean);
      colorInfo.innerHTML = `
        <div class="row" style="gap:1rem; align-items:center;">
          <div class="swatch" style="width:72px;height:72px;background:${hexVal}" data-dark="${isDark(hexVal.slice(1))?1:0}"></div>
          <div>
            <div><strong>${colorData?.name?.value ?? '—'}</strong></div>
            <div>HEX: ${hexVal}</div>
            <div>RGB: ${colorData?.rgb ? `${colorData.rgb.r}, ${colorData.rgb.g}, ${colorData.rgb.b}` : '—'}</div>
          </div>
        </div>
        <button id="useThisColorBtn" type="button">Diese Farbe verwenden</button>
      `;
      document.getElementById('useThisColorBtn').onclick = () => pickColor(hexVal);

      // Palette rendern
      paletteGrid.innerHTML = '';
      (schemeData?.colors || []).forEach(c => {
        const h = c.hex.value;
        const btn = document.createElement('button');
        btn.className = 'swatch';
        btn.style.background = h;
        btn.dataset.dark = isDark(h.slice(1)) ? '1' : '0';
        btn.textContent = h;
        btn.title = h;
        btn.type = 'button';
        btn.onclick = () => pickColor(h);
        paletteGrid.appendChild(btn);
      });
    } catch (e) {
      console.error(e);
      alert('Konnte Farben nicht laden.');
    }
  }

  // >>> Änderung: „Laden“ erzeugt jetzt eine Zufallsfarbe und lädt sie
  fetchColorBtn.addEventListener('click', () => {
    const rnd = randomHex();             // z. B. "A3F24B"
    hexInput.value = '#' + rnd;          // UI updaten (optional)
    loadColor(rnd, modeSelect.value);    // Daten & Palette laden
  });

  // (Enter im Eingabefeld darf weiterhin manuell laden, falls du willst)
  hexInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadColor(tidyHex(hexInput.value || ''), modeSelect.value);
  });
}
