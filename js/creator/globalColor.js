import { getCurrentSection, getState, setBgColor } from "./state.js";
import { drawAll } from "./draw.js";

export function bindGlobalColor(inputEl) {
  inputEl.addEventListener("input", (e) => {
    const val = e.target.value;
    const section = getCurrentSection();
    const state = getState();

    if (section === "bg") {
      setBgColor(val);
    } else if (section === "accessory") {
      if (state.accessory?.src) state.accessory.color = val;
    } else {
      if (state[section]) state[section].color = val;
    }

    drawAll();
  });
}

