// ==== Einfacher Avatar-Creator (Canvas + PNG Coloring) ====

// --- Canvas Setup ---
const SIZE = 800;  // Arbeitsgröße, bleibt schön scharf
const canvas = document.getElementById('stageCanvas');
const ctx = canvas.getContext('2d');

// --- UI Refs ---
const tabs = document.querySelectorAll('.section-tab');
const optionsEl = document.getElementById('options');
const colorInput = document.getElementById('colorPicker');

// --- State ---
let currentSection = 'hair';
let bgColor = '#d9ecff';     // sichtbarer Stage-Background (auch ohne Avatar)
const state = {
  hair:   { src: '', color: '#5aa6ff' },
  eyes:   { src: '', color: '#000000' },
  mouth:  { src: '', color: '#000000' },
  accessory: { src: '', color: '#000000' }
};

// --- Deine Assets (Passe die Pfade an deine Dateien an!) ---
const ASSETS = {
  hair: [
    'assets/images/hair/hair-01.png',
    'assets/hair/hair-02.png'
  ],
  eyes: [
    'assets/eyes/eyes-01.png',
    'assets/eyes/eyes-02.png'
  ],
  mouth: [
    'assets/mouth/mouth-01.png'
  ],
  accessory: [
    'assets/accessory/hat-01.png'
  ],
  // optional: Base/Face, falls du eine feste Grundform hast
  base: 'assets/images/base/defaultBase.png'
};

// --- Helpers ---
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous'; // falls nötig
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function tintPng(img, color) {
  if (!img) return null;
  // Offscreen in NATURGRÖSSE des Bildes
  const off = document.createElement('canvas');
  off.width = img.naturalWidth || img.width;
  off.height = img.naturalHeight || img.height;
  const octx = off.getContext('2d');

  // 1) Original unverzerrt in Offscreen zeichnen
  octx.drawImage(img, 0, 0, off.width, off.height);

  // 2) Alpha als Maske nutzen und Farbe füllen
  octx.globalCompositeOperation = 'source-in';
  octx.fillStyle = color;
  octx.fillRect(0, 0, off.width, off.height);

  // 3) zurücksetzen
  octx.globalCompositeOperation = 'source-over';
  return off;
}

function drawFitted(srcCanvasOrImg, destCtx, destSize, fit = 'contain', padding = 0.06) {
  // padding: z.B. 0.06 = 6% Innenrand ringsum
  const iw = srcCanvasOrImg.width;
  const ih = srcCanvasOrImg.height;
  if (!iw || !ih) return;

  const avail = destSize * (1 - padding * 2);          // Platz innerhalb des Rahmens
  const scale = (fit === 'cover')
    ? Math.max(avail / iw, avail / ih)
    : Math.min(avail / iw, avail / ih);                // "contain" ist Standard

  const w = iw * scale;
  const h = ih * scale;

  const dx = (destSize - w) / 2;
  const dy = (destSize - h) / 2;

  destCtx.drawImage(srcCanvasOrImg, dx, dy, w, h);
}

// --- Render-Pipeline ---
async function draw() {
  // Hintergrund (Stage sichtbar, auch ohne Avatar)
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Optional: Base/Face
  // Base
    const baseImg = await loadImage(ASSETS.base);
    if (baseImg) drawFitted(baseImg, ctx, SIZE, 'contain', 0.04);

    // Layer
    const order = ['hair', 'eyes', 'mouth', 'accessory'];
    for (const key of order) {
        const part = state[key];
        if (!part.src) continue;
        const img = await loadImage(part.src);

        const colorable = (key === 'hair' || key === 'accessory');
        if (colorable) {
            const tinted = tintPng(img, part.color);          // offscreen Canvas mit Farbe
            drawFitted(tinted, ctx, SIZE, 'contain', 0.04);   // **hier** proportional zentriert zeichnen
        } else {
            drawFitted(img, ctx, SIZE, 'contain', 0.04);
        }
    }
}

// --- Options UI befüllen ---
function renderOptions(section) {
  optionsEl.innerHTML = '';
  if (section === 'bg') {
    // Für Hintergrund zeigen wir keine Bilder – Farbe via Picker
    optionsEl.innerHTML = '<div style="grid-column: 1 / -1; opacity:.8;">Ändere den Hintergrund mit dem Farbwähler.</div>';
    colorInput.value = rgbToHex(bgColor);
    return;
  }

  const list = ASSETS[section] || [];
  list.forEach(src => {
    const btn = document.createElement('button');
    btn.className = 'option' + (state[section].src === src ? ' is-selected' : '');
    btn.title = src.split('/').pop();

    const img = new Image();
    img.src = src;
    img.alt = section;
    btn.appendChild(img);

    btn.addEventListener('click', () => {
      state[section].src = src;
      // Standardfarbe ins Pickerfeld laden
      colorInput.value = rgbToHex(state[section].color);
      renderOptions(section);
      draw();
    });

    optionsEl.appendChild(btn);
  });
}

// --- Tabs Logik ---
tabs.forEach(t => {
  t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('is-active'));
    t.classList.add('is-active');
    currentSection = t.dataset.section;
    // Colorpicker mit aktueller Farbe vorbereiten
    if (currentSection === 'bg') {
      colorInput.value = rgbToHex(bgColor);
    } else {
      colorInput.value = rgbToHex(state[currentSection].color);
    }
    renderOptions(currentSection);
  });
});

// --- Color Picker Logik ---
colorInput.addEventListener('input', (e) => {
  const val = e.target.value; // hex
  if (currentSection === 'bg') {
    bgColor = val;
  } else {
    // falls Section noch nichts ausgewählt hat → keine Panik, nur Farbe merken
    if (!state[currentSection]) return;
    state[currentSection].color = val;
  }
  draw();
});

// --- kleine Utils ---
function rgbToHex(c) { return c.startsWith('#') ? c : c; }

// --- Initial ---
(function init() {
  // Default: aktive Sektion "Haare"
  const startTab = document.querySelector('.section-tab[data-section="hair"]');
  if (startTab) startTab.classList.add('is-active');

  renderOptions('hair');   // erste Optionsliste
  colorInput.value = rgbToHex(state.hair.color);

  draw(); // zeigt sofort eine sichtbare Stage mit Hintergrund an
})();
