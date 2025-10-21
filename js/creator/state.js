export const MULTI_CATEGORIES = new Set(); // wird in main.js gefüllt
let currentSection = "stem";
let bgColor = "#d9ecff";
let lastPicked = null; // { section, src } oder null

const state = {
  stem: { src: "", color: "#5aa6ff" },
  eyes: { src: "", color: "#791c17" },
  mouth: { src: "", color: "#791c17" },
  accessory: [] // [{src,color,on:true}]
};

export const getState = () => state;
export const getCurrentSection = () => currentSection;
export const setCurrentSection = (s) => (currentSection = s);
export const getBgColor = () => bgColor;
export const setBgColor = (c) => (bgColor = c);
export const getLastPicked = () => lastPicked;
export const setLastPicked = (lp) => (lastPicked = lp);
