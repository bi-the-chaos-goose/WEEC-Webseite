import { ASSETS } from "./assets.js";
import { getState, setBgColor } from "./state.js";
import { drawAll } from "./draw.js";
import { randomHex, shuffle } from "./utils.js";

export function bindRandomize(btn, panelRefresh) {
  btn?.addEventListener("click", () => {
    const s = getState();
    ["hair","eyes","mouth"].forEach(sec => {
      const list = ASSETS[sec] || [];
      if (!list.length) return;
      const pick = list[Math.floor(Math.random()*list.length)];
      s[sec].src = pick; s[sec].color = randomHex();
    });
    if (ASSETS.accessory?.length) {
      const picks = shuffle(ASSETS.accessory).slice(0, Math.floor(Math.random()*4));
      s.accessory = picks.map(src => ({ src, color: randomHex(), on: true }));
    }
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
