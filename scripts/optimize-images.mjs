// Convierte las fotos originales (JPG) a WebP optimizado para /public/images.
// Uso: node scripts/optimize-images.mjs <carpeta-origen>
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const src = process.argv[2];
if (!src) throw new Error("Indica la carpeta con las imágenes originales");
const out = path.resolve("public/images");
for (const f of (await readdir(src)).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const name = f.replace(/\.(jpe?g|png)$/i, "");
  const img = sharp(path.join(src, f)).rotate();
  const meta = await img.metadata();
  const info = await img
    .resize({ width: Math.min(meta.width ?? 2400, 2400), withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(path.join(out, `${name}.webp`));
  console.log(name, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}
