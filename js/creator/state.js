let currentSection = "stem";
let bgColor = "#d9ecff";

const state = {
  stem: { src: "", color: "#5aa6ff" },
  eyes: { src: "", color: "#791c17" },
  mouth: { src: "", color: "#791c17" },
  accessory: { src: "", color: "#5aa6ff", on: true }
};

export const getState = () => state;
export const getCurrentSection = () => currentSection;
export const setCurrentSection = (s) => (currentSection = s);
export const getBgColor = () => bgColor;
export const setBgColor = (c) => (bgColor = c);