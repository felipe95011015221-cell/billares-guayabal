// Recorta las franjas negras de capturas de pantalla y aplica la edición suave de la galería.
// Uso: node scripts/editar-fotos-galeria.mjs <entrada> <salida.webp> [<entrada> <salida.webp> ...]
import sharp from "sharp";
const pares = process.argv.slice(2);
for (let i = 0; i < pares.length; i += 2) {
  const [src, out] = [pares[i], pares[i + 1]];
  // trim() elimina los bordes del color de la esquina (negro) con tolerancia.
  const recortada = await sharp(src).rotate().trim({ background: "#000000", threshold: 40 }).toBuffer();
  const meta = await sharp(recortada).metadata();
  // Margen de seguridad de 4 px por si quedó una línea oscura del borde.
  const m = 4;
  const info = await sharp(recortada)
    .extract({ left: m, top: m, width: meta.width - 2 * m, height: meta.height - 2 * m })
    .modulate({ brightness: 1.03, saturation: 1.1 })
    .linear(1.07, -8)
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.5 })
    .webp({ quality: 86 })
    .toFile(out);
  console.log(out.split("/").pop(), `${info.width}x${info.height}`, `${Math.round(info.size / 1024)}KB`);
}
