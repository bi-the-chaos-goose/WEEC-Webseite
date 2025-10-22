// js/creator/main.js
import { initCanvas, drawAll } from "./draw.js";
import { renderOptions } from "./optionsUI.js";
import { initTabs } from "./tabs.js";
import { bindGlobalColor } from "./globalColor.js";
import { bindRandomize, bindDownload, bindRandomColor } from "./actions.js";
import { rgbToHex } from "./utils.js";
import { getState, getCurrentSection, getBgColor } from "./state.js";

console.log("[creator] main.js loaded"); // Sichtprobe in der Konsole

const canvas = document.getElementById("stageCanvas");
const tabs = document.querySelectorAll(".section-tab");
const tpl = document.getElementById("tpl-option-card");
const panel = document.getElementById("optionsPanel");
//const clearBtn = document.getElementById("clearCategoryBtn");
const globalPicker = document.getElementById("colorPicker");
const randomizeBtn = document.getElementById("randomizeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const randomColorBtn = document.getElementById("randomColorBtn");
const randColorInfo = document.getElementById("randColorInfo");

initCanvas(canvas);
initTabs(tabs, tpl, panel);
renderOptions(tpl, panel);

bindGlobalColor(globalPicker);
bindRandomize(randomizeBtn, () => renderOptions(tpl, panel));
bindDownload(downloadBtn, canvas);
bindRandomColor(randomColorBtn, randColorInfo, globalPicker);

{
   const s = getState();
   const sec = getCurrentSection();
   let initial = "#000000";
   if (sec === "bg") {
     initial = getBgColor();
   } else if (sec === "accessory") {
     initial = s.accessory?.color ?? "#000000";
   } else {
     initial = s[sec]?.color ?? "#000000";
   }
   globalPicker.value = rgbToHex(initial);
}
drawAll();
