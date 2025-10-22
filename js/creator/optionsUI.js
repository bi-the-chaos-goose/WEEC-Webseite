// js/creator/optionsUI.js
import { ASSETS } from "./assets.js";
import { rgbToHex } from "./utils.js";
import { getState, getCurrentSection } from "./state.js";
import { drawAll } from "./draw.js";

export function renderOptions(tplEl, panelEl) {
  const section = getCurrentSection();
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
    card.dataset.id = src;
    card.dataset.cat = section;

    // Vorschaubild robust laden
    const img = card.querySelector(".thumb");
    const picker = card.querySelector(".color-input");

    let resolved = String(src).replace(/\\/g, "/");
    resolved = resolved.replace(/(assets\/images\/)+/i, "assets/images/");
    try {
      resolved = new URL(resolved, document.baseURI).href;
    } catch (_) { /* ignore */ }

    img.loading = "eager";
    img.decoding = "sync";
    img.alt = section;
    img.src = resolved;

    img.addEventListener("error", (e) => {
      console.error("[thumb 404]", section, resolved, e);
      const wrap = card.querySelector(".card-thumb");
      wrap.style.background = "#fff1f1";
      wrap.title = "Bild nicht gefunden:\n" + resolved;
    });

    // --- Single-Select für alle Sektionen inkl. accessory ---
    const part = section === "accessory" ? state.accessory : state[section];
    const selected = !!part?.src && part.src === src;

    card.dataset.on = String(selected);
    picker.value = rgbToHex(selected ? (part.color ?? "#ff8800") : "#ff8800");
    picker.disabled = !selected;

    // Karte klick: auswählen / abwählen
    card.addEventListener("click", (e) => {
      if (e.target.closest(".color-input")) return; // Klick auf Picker ignorieren

      const wasSelected = !!part?.src && part.src === src;

      if (section === "accessory") {
        // toggle accessory (Objekt)
        if (wasSelected) {
          state.accessory.src = "";
          // Farbe optional behalten
        } else {
          state.accessory.src = src;
          state.accessory.color = picker.value || "#ff8800";
          state.accessory.on = true;
        }
      } else {
        // toggle für stem/eyes/mouth
        if (wasSelected) {
          state[section].src = "";
          // Farbe optional behalten
        } else {
          state[section].src = src;
          state[section].color = picker.value || "#ff8800";
        }
      }

      renderOptions(tplEl, panelEl);
      drawAll();
    });

    // Farbwähler: nur wenn aktuell ausgewählt
    picker.addEventListener("input", (e) => {
      const val = e.target.value;
      if (section === "accessory") {
        if (state.accessory?.src === src) {
          state.accessory.color = val;
          drawAll();
        }
      } else {
        if (state[section]?.src === src) {
          state[section].color = val;
          drawAll();
        }
      }
    });

    panelEl.appendChild(card);
  });
}
