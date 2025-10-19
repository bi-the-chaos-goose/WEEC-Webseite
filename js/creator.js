// ==== Einfacher Avatar-Creator (Canvas + PNG Coloring) ====

// --- Pfad-Basis je nach Ordner-Tiefe ermitteln (../ für /html/, "" im Root) ---
const _parts = window.location.pathname.split("/").filter(Boolean);
// z. B. "/" -> [], "/html/avatarCreationPage.html" -> ["html","avatarCreationPage.html"]
const _depth = Math.max(_parts.length - 1, 0);
const ROOT = _depth > 0 ? "../".repeat(_depth) : "";

// >>> HIER ggf. anpassen, falls deine Bilder anders liegen (z. B. `${ROOT}images/`)
const IMG_BASE = `${ROOT}assets/images/`;

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
  hair:      { src: '', color: '#5aa6ff' },
  eyes:      { src: '', color: '#791c17' },
  mouth:     { src: '', color: '#791c17' },
  accessory: { src: '', color: '#791c17' }
};

// --- Deine Assets (einheitlich über IMG_BASE) ---
const ASSETS = {
  hair: [
    `${IMG_BASE}hair/hair-01.png`,
    `${IMG_BASE}hair/hair-02.png`
  ],
  eyes: [
    `${IMG_BASE}face/eyes/eyes_01.png`,
    `${IMG_BASE}face/eyes/eyes_02.png`,
    `${IMG_BASE}face/eyes/eyes_03.png`,
    `${IMG_BASE}face/eyes/eyes_04.png`,
    `${IMG_BASE}face/eyes/eyes_05.png`
  ],
  mouth: [
    `${IMG_BASE}face/mouth/mouth_01.png`,
    `${IMG_BASE}face/mouth/mouth_02.png`
  ],
  accessory: [
    `${IMG_BASE}accessory/hat-01.png`
  ],
  // optional: Base/Face, falls du eine feste Grundform hast
  base: `${IMG_BASE}base/defaultBase.png`
};

// --- Helpers ---
function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve(null);
    const img = new Image();
    // Nur nötig, wenn Bilder von anderer Domain kommen:
    // img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn('Bild konnte nicht geladen werden:', src);
      reject(e);
    };
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

  // 1) Original unverzerrt zeichnen
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
  const iw = srcCanvasOrImg.width;
  const ih = srcCanvasOrImg.height;
  if (!iw || !ih) return;

  const avail = destSize * (1 - padding * 2); // Platz innerhalb des Rahmens
  const scale = (fit === 'cover')
    ? Math.max(avail / iw, avail / ih)
    : Math.min(avail / iw, avail / ih);      // "contain" ist Standard

  const w = iw * scale;
  const h = ih * scale;

  const dx = (destSize - w) / 2;
  const dy = (destSize - h) / 2;

  destCtx.drawImage(srcCanvasOrImg, dx, dy, w, h);
}

// --- Render-Pipeline ---
async function draw() {
  // Hintergrund
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Optional: Base
  try {
    const baseImg = await loadImage(ASSETS.base);
    if (baseImg) drawFitted(baseImg, ctx, SIZE, 'contain', 0.04);
  } catch {}

  // Layer in Reihenfolge
  const order = ['hair', 'mouth','eyes', 'accessory'];
  for (const key of order) {
    const part = state[key];
    if (!part.src) continue;

    try {
      const img = await loadImage(part.src);
      const colorable = (key === 'hair' || key === 'accessory' || key === 'mouth' || key === 'eyes');
      if (colorable) {
        const tinted = tintPng(img, part.color);
        drawFitted(tinted, ctx, SIZE, 'contain', 0.04);
      } else {
        drawFitted(img, ctx, SIZE, 'contain', 0.04);
      }
    } catch {
      // Fehler schon in loadImage geloggt
    }
  }
}

// --- Options UI befüllen ---
function renderOptions(section) {
  optionsEl.innerHTML = '';

  if (section === 'bg') {
    optionsEl.innerHTML = '<div style="grid-column: 1 / -1; opacity:.8;">Ändere den Hintergrund mit dem Farbwähler.</div>';
    colorInput.value = rgbToHex(bgColor);
    return;
  }

  const list = ASSETS[section] || [];
  list.forEach(src => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option' + (state[section].src === src ? ' is-selected' : '');
    btn.title = src.split('/').pop();

    const img = new Image();
    img.src = src;
    img.alt = section;
    btn.appendChild(img);

    btn.addEventListener('click', () => {
      state[section].src = src;
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
    tabs.forEach(x => {
      x.classList.remove('is-active');
      x.setAttribute('aria-selected', 'false');
    });
    t.classList.add('is-active');
    t.setAttribute('aria-selected', 'true');

    currentSection = t.dataset.section;
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
    if (!state[currentSection]) return;
    state[currentSection].color = val;
  }
  draw();
});

// --- kleine Utils ---
function rgbToHex(c) { return c && c.startsWith('#') ? c : (c || '#000000'); }

// --- Initial ---
(function init() {
  // Default: aktive Sektion "Haare"
  const startTab = document.querySelector('.section-tab[data-section="hair"]');
  if (startTab) {
    startTab.classList.add('is-active');
    startTab.setAttribute('aria-selected', 'true');
  }

  renderOptions('hair');   // erste Optionsliste
  colorInput.value = rgbToHex(state.hair.color);

  draw(); // zeigt sofort eine sichtbare Stage mit Hintergrund an
})();