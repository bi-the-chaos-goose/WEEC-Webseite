import { setCurrentSection, MULTI_CATEGORIES } from "./state.js";
import { renderOptions } from "./optionsUI.js";

export function initTabs(tabsNodeList, tplEl, panelEl, clearBtnEl) {
  // Multi-Cats vom DOM ableiten (einmalig)
  [...tabsNodeList].forEach(b => { if (b.dataset.multi === "true") MULTI_CATEGORIES.add(b.dataset.section); });

  tabsNodeList.forEach(t => {
    t.addEventListener("click", () => {
      tabsNodeList.forEach(x => { x.classList.remove("is-active"); x.setAttribute("aria-selected","false"); });
      t.classList.add("is-active"); t.setAttribute("aria-selected","true");
      setCurrentSection(t.dataset.section);
      clearBtnEl.style.display = t.dataset.multi === "true" ? "" : "none";
      renderOptions(tplEl, panelEl);
    });
  });
}
