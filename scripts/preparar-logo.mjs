// Quita el fondo blanco exterior del logo (relleno desde los bordes) y genera los tamaños usados en la web.
// Uso: node scripts/preparar-logo.mjs <logo-original>
import sharp from "sharp";
const src = process.argv[2];
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
const fondo = new Uint8Array(W * H);
const cola = [];
const empujar = (x, y) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const p = y * W + x;
  if (fondo[p]) return;
  if (lum(p * 4) < 170) return; // borde negro del escudo: se detiene
  fondo[p] = 1;
  cola.push(p);
};
for (let x = 0; x < W; x++) { empujar(x, 0); empujar(x, H - 1); }
for (let y = 0; y < H; y++) { empujar(0, y); empujar(W - 1, y); }
while (cola.length) { const p = cola.pop(); const x = p % W, y = (p / W) | 0; empujar(x + 1, y); empujar(x - 1, y); empujar(x, y + 1); empujar(x, y - 1); }
// Fondo -> transparente; píxeles de transición (antialias) junto al fondo -> negro con alfa proporcional.
for (let p = 0; p < W * H; p++) {
  const i = p * 4;
  if (fondo[p]) { data[i + 3] = 0; continue; }
  const x = p % W, y = (p / W) | 0;
  const vecinoFondo = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => { const q = (y+dy)*W + (x+dx); return x+dx>=0 && x+dx<W && y+dy>=0 && y+dy<H && fondo[q]; });
  if (vecinoFondo) { const a = Math.round(255 - lum(i)); data[i] = data[i+1] = data[i+2] = 0; data[i + 3] = Math.max(a, 0); }
}
const base = sharp(data, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 1 });
const recortado = await base.png().toBuffer();
const meta = await sharp(recortado).metadata();
console.log("recortado", meta.width, meta.height);
await sharp(recortado).resize({ width: 900 }).webp({ quality: 90, alphaQuality: 100 }).toFile("public/images/logo.webp");
await sharp(recortado).resize({ width: 900 }).png({ compressionLevel: 9 }).toFile("public/images/logo.png");
// Íconos: escudo centrado en lienzo cuadrado transparente
const cuadrado = async (lado, archivo, fondoColor) => {
  const interior = Math.round(lado * 0.92);
  const img = await sharp(recortado).resize({ width: interior, height: interior, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  await sharp({ create: { width: lado, height: lado, channels: 4, background: fondoColor } }).composite([{ input: img, gravity: "center" }]).png().toFile(archivo);
};
await cuadrado(512, "src/app/icon.png", { r: 0, g: 0, b: 0, alpha: 0 });
await cuadrado(180, "src/app/apple-icon.png", { r: 17, g: 23, b: 20, alpha: 1 });
console.log("ok");
