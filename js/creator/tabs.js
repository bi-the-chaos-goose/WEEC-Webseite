import { setCurrentSection } from "./state.js";
import { renderOptions } from "./optionsUI.js";

export function initTabs(tabsNodeList, tplEl, panelEl) {
  tabsNodeList.forEach(t => {
    t.addEventListener("click", () => {
      tabsNodeList.forEach(x => {
        x.classList.remove("is-active");
        x.setAttribute("aria-selected", "false");
      });
      t.classList.add("is-active");
      t.setAttribute("aria-selected", "true");

      setCurrentSection(t.dataset.section);
      renderOptions(tplEl, panelEl);
    });
  });
}
