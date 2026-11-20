// Edición tipo "foto de estudio oscura": baja la exposición, sube contraste,
// oscurece los bordes (viñeta) centrando la luz en el rostro y el taco.
// Uso: node scripts/editar-foto-estudio.mjs <entrada> <salida.webp>
import sharp from "sharp";
const [src, out] = process.argv.slice(2);
const { width: W, height: H } = await sharp(src).metadata();
// Viñeta: luz centrada sobre el jugador (izquierda-centro), bordes casi negros.
const vineta = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="v" cx="0.46" cy="0.62" r="0.82">
      <stop offset="0.28" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.62" stop-color="#000" stop-opacity="0.62"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.95"/>
    </radialGradient>
    <linearGradient id="t" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.7"/>
      <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="d" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#t)"/>
  <rect width="100%" height="100%" fill="url(#d)"/>
  <rect width="100%" height="100%" fill="url(#v)"/>
</svg>`);
const info = await sharp(src)
  .modulate({ brightness: 0.72, saturation: 0.9 })
  .linear(1.25, -20) // más contraste, sombras más profundas
  .composite([{ input: vineta, blend: "over" }])
  .sharpen({ sigma: 0.8 })
  .webp({ quality: 86 })
  .toFile(out);
console.log(out, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
