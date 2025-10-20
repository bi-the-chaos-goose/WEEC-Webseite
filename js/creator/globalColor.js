import { getCurrentSection, getState, getLastPicked, setBgColor, MULTI_CATEGORIES } from "./state.js";
import { drawAll } from "./draw.js";

export function bindGlobalColor(inputEl) {
  inputEl.addEventListener("input", (e) => {
    const val = e.target.value;
    const section = getCurrentSection();
    const state = getState();

    if (section === "bg") {
      setBgColor(val);
    } else if (MULTI_CATEGORIES.has(section)) {
      const lp = getLastPicked();
      if (lp && lp.section === section) {
        const it = state[section].find(x => x.src === lp.src);
        if (it) it.color = val;
      } else {
        state[section].forEach(x => { if (x.on) x.color = val; });
      }
    } else {
      state[section].color = val;
    }
    drawAll();
  });
}
