export const rgbToHex = (c) => (c && c.startsWith("#") ? c : (c || "#000000"));
export const randomHex = () => "#" + Math.floor(Math.random()*0xFFFFFF).toString(16).padStart(6,"0");