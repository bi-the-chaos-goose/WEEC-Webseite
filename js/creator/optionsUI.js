import { ASSETS } from "./assets.js";
import { rgbToHex } from "./utils.js";
import { getState, getCurrentSection, setLastPicked, MULTI_CATEGORIES } from "./state.js";
import { drawAll } from "./draw.js";

export function renderOptions(tplEl, panelEl) {
  const section = getCurrentSection();
  const isMulti = MULTI_CATEGORIES.has(section);
  const state = getState();
  panelEl.innerHTML = "";
  panelEl.dataset.category = section;

  // BG-Spezialfall
  if (section === "bg") {
    const div = document.createElement("div");
    div.style.gridColumn = "1 / -1";
    div.style.opacity = ".8";
    div.textContent = "Hintergrundfarbe über den Farbwähler ändern.";
    panelEl.appendChild(div);
    return;
  }

  const list = ASSETS[section] || [];
  list.forEach(src => {
    const card = tplEl.content.firstElementChild.cloneNode(true);
    card.dataset.id = src; card.dataset.cat = section;

    const img = card.querySelector(".thumb");
const picker = card.querySelector(".color-input");

// --- Pfad robust machen & debuggen ---
let resolved = String(src).replace(/\\/g, "/"); // Windows \ → /
resolved = resolved.replace(/(assets\/images\/)+/i, "assets/images/"); // doppelte Segmente vermeiden

try {
  resolved = new URL(resolved, document.baseURI).href; // absolute URL ausrechnen
} catch (_) {
  // Fallback: unverändert lassen
}

img.loading = "eager";
img.decoding = "sync";
img.alt = section;
img.src = resolved;

console.log("[thumb load]", section, resolved);
img.addEventListener("error", (e) => {
  console.error("[thumb 404]", section, resolved, e);
  const wrap = card.querySelector(".card-thumb");
  wrap.style.background = "#fff1f1"; // visuelles Signal
  wrap.title = "Bild nicht gefunden:\n" + resolved;
});



    if (isMulti) {
      let it = state[section].find(x => x.src === src) || { src, color:"#ff8800", on:false };
      card.dataset.on = String(it.on);
      picker.value = rgbToHex(it.color);
      picker.disabled = !it.on;

      // Karte toggelt, Picker klick toggelt NICHT
      card.addEventListener("click", (e) => {
        if (e.target.closest(".color-input")) return;
        const idx = state[section].findIndex(x => x.src === src);
        if (idx >= 0) {
          state[section][idx].on = !state[section][idx].on;
          setLastPicked(state[section][idx].on ? { section, src } : null);
        } else {
          state[section].push({ src, color: picker.value || "#ff8800", on:true });
          setLastPicked({ section, src });
        }
        renderOptions(tplEl, panelEl);
        drawAll();
      });

      picker.addEventListener("input", (e) => {
        const val = e.target.value;
        const idx = state[section].findIndex(x => x.src === src);
        if (idx >= 0) { state[section][idx].color = val; setLastPicked({ section, src }); drawAll(); }
      });

    } else {
      const selected = state[section].src === src;
      card.dataset.on = String(selected);
      picker.value = rgbToHex(selected ? state[section].color : "#ff8800");
      picker.disabled = !selected;

      card.addEventListener("click", (e) => {
        if (e.target.closest(".color-input")) return;
        const wasSelected = state[section].src === src;
        state[section].src = src;
        if (!wasSelected) state[section].color = picker.value || "#ff8800";
        renderOptions(tplEl, panelEl);
        drawAll();
      });

      picker.addEventListener("input", (e) => {
        if (state[section].src === src) { state[section].color = e.target.value; drawAll(); }
      });
    }

    panelEl.appendChild(card);
  });
}
