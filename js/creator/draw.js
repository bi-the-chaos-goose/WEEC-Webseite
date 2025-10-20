import { ASSETS } from "./assets.js";
import { getState, getBgColor, MULTI_CATEGORIES } from "./state.js";

const SIZE = 800;
let ctx;

export const initCanvas = (canvas) => { ctx = canvas.getContext("2d"); };

export const loadImage = (src) => new Promise((res, rej) => {
  if (!src) return res(null);
  const img = new Image();
  img.onload = () => res(img);
  img.onerror = (e) => rej(e);
  img.src = src;
});

export function tintPng(img, color) {
  if (!img) return null;
  const off = document.createElement("canvas");
  off.width = img.naturalWidth || img.width;
  off.height = img.naturalHeight || img.height;
  const octx = off.getContext("2d");
  octx.drawImage(img, 0, 0, off.width, off.height);
  octx.globalCompositeOperation = "source-in";
  octx.fillStyle = color;
  octx.fillRect(0, 0, off.width, off.height);
  octx.globalCompositeOperation = "source-over";
  return off;
}

// drawFitted erwartet: (src, destSize = SIZE, padding = 0.04)
export function drawFitted(src, destSize = SIZE, padding = 0.04) {
  const iw = src.width, ih = src.height;
  if (!iw || !ih) return;
  const avail = destSize * (1 - padding * 2);
  const scale = Math.min(avail / iw, avail / ih);
  const w = iw * scale, h = ih * scale;
  const dx = (destSize - w) / 2, dy = (destSize - h) / 2;
  ctx.drawImage(src, dx, dy, w, h);
}

export async function drawAll() {
  const s = getState();
  const bg = getBgColor();

  // Hintergrund
  ctx.clearRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Base
  try {
    const baseImg = await loadImage(ASSETS.base);
    if (baseImg) drawFitted(baseImg); // ✅ korrekt (keine ctx/contain-Argumente)
  } catch (e) {
    console.error("[base 404]", ASSETS.base, e);
  }

  // Reihenfolge der Layer
  const order = ["hair", "mouth", "eyes", "accessory"];

  for (const key of order) {
    if (MULTI_CATEGORIES.has(key)) {
      // Mehrfach-Layer
      for (const item of s[key]) {
        if (!item.on) continue;
        try {
          const img = await loadImage(item.src);
          if (!img) continue;
          drawFitted(tintPng(img, item.color));
        } catch (e) {
          console.error("[layer 404]", key, item.src, e);
        }
      }
    } else {
      // Single-Layer
      const part = s[key];
      if (!part.src) continue;
      try {
        const img = await loadImage(part.src);
        if (!img) continue;
        drawFitted(tintPng(img, part.color));
      } catch (e) {
        console.error("[layer 404]", key, part.src, e);
      }
    }
  }
}
