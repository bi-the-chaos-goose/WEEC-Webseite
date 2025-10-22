document.addEventListener("DOMContentLoaded", () => {
  // aktuelle Datei (z. B. "aboutUs.html" oder "index.html")
  let currentPath = window.location.pathname;
  if (currentPath.endsWith("/")) currentPath += "index.html";
  const currentFile = currentPath.split("/").pop().toLowerCase();

  document.querySelectorAll("nav .right a").forEach(a => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    // absolute URL auflösen (damit ../ funktioniert)
    const url = new URL(href, window.location.href);
    let targetPath = url.pathname;
    if (targetPath.endsWith("/")) targetPath += "index.html";
    const targetFile = targetPath.split("/").pop().toLowerCase();

    if (targetFile === currentFile) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
      a.removeAttribute("href"); // macht Link nicht klickbar
    }
  });
});

// === Zufallsfarbe via Color API (nur anzeigen; Übernahme nur auf Klick) ===
const randomColorBtn = document.getElementById('randomColorBtn');
const randColorInfo  = document.getElementById('randColorInfo');
const colorPicker    = document.getElementById('colorPicker');

if (randomColorBtn && randColorInfo && colorPicker) {
  const randomHex = () => Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,'0');
  const isDark = (hex) => {
    const n = parseInt(hex, 16);
    const r = (n>>16)&255, g = (n>>8)&255, b = n&255;
    const L = 0.2126*(r/255) + 0.7152*(g/255) + 0.0722*(b/255);
    return L < 0.55;
  };

  async function showRandomColor() {
    const rnd = randomHex();                // z. B. "F835C2"
    const url = `https://www.thecolorapi.com/id?hex=${rnd}`;

    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('API error');
      const d = await res.json();

      const hex = d?.hex?.value || ('#' + rnd); // "#RRGGBB"
      const name = d?.name?.value ?? '—';
      const rgb = d?.rgb ? `${d.rgb.r}, ${d.rgb.g}, ${d.rgb.b}` : '—';

      randColorInfo.innerHTML = `
        <div style="display:flex; gap:1rem; align-items:center;">
          <span class="swatch" style="background:${hex}"></span>
          <div>
            <div><strong>${name}</strong></div>
            <div>HEX: ${hex}</div>
            <div>RGB: ${rgb}</div>
          </div>
        </div>
        <button id="applyRandColorBtn" type="button" style="margin-top:.5rem;">Diese Farbe verwenden</button>
      `;

      // Übernimmt die Farbe NUR wenn man klickt:
      document.getElementById('applyRandColorBtn').onclick = () => {
        colorPicker.value = hex;
        // Falls dein Avatar-Code auf 'input' hört, feuern wir es hier gezielt aus:
        colorPicker.dispatchEvent(new Event('input', { bubbles: true }));
      };

    } catch (e) {
      console.error(e);
      randColorInfo.textContent = 'Fehler beim Laden der Farbe.';
    }
  }

  randomColorBtn.addEventListener('click', showRandomColor);
}

