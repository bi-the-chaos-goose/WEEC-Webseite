import { ASSETS } from "./assets.js";
import { getState, setBgColor } from "./state.js";
import { drawAll } from "./draw.js";
import { randomHex } from "./utils.js";

export function bindRandomize(btn, panelRefresh) {
  btn?.addEventListener("click", () => {
    const s = getState();
    ["stem","eyes","mouth"].forEach(sec => {
      const list = ASSETS[sec] || [];
      if (!list.length) return;
      const pick = list[Math.floor(Math.random()*list.length)];
      s[sec].src = pick; s[sec].color = randomHex();
    });
    const takeOne = Math.random() < 0.6; // ggf. auf true setzen, wenn immer eins
     s.accessory = takeOne
       ? {
           src: ASSETS.accessory[Math.floor(Math.random() * ASSETS.accessory.length)],
           color: randomHex(),
           on: true
         }
       : {
           // leer wählen, Farbe behalten (falls UI die weiter nutzt) oder neu setzen
           src: "",
           color: s.accessory?.color ?? randomHex(),
           on: true
         };
    setBgColor(randomHex());
    panelRefresh();
    drawAll();
  });
}

export function bindDownload(btn, canvas) {
  btn?.addEventListener("click", () => {
    const a = document.createElement("a");
    a.download = "pumpkinforge.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  });
}

export function bindRandomColor(btn, infoEl, globalPicker) {
  btn?.addEventListener("click", () => {
    const c = randomHex();
    globalPicker.value = c;
    globalPicker.dispatchEvent(new Event("input", { bubbles:true }));
    if (infoEl) infoEl.textContent = `#${c.slice(1).toUpperCase()}`;
  });
}
