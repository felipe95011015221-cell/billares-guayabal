// Edición suave de las fotos reales del club: recorte, contraste, color y nitidez. Sin metadatos EXIF.
// Uso: node scripts/editar-fotos-club.mjs <salon.jpg> <mesa.jpg>
import sharp from "sharp";
const [salon, mesa] = process.argv.slice(2);
const editar = (src, recorte, salida) =>
  sharp(src)
    .rotate()
    .extract(recorte)
    .modulate({ brightness: 1.03, saturation: 1.1 })
    .linear(1.07, -8) // un poco más de contraste
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.5 })
    .webp({ quality: 86 })
    .toFile(salida)
    .then((i) => console.log(salida, `${i.width}x${i.height}`, `${Math.round(i.size / 1024)}KB`));
// Salón: se recorta parte del piso inferior (proporción 4:5).
await editar(salon, { left: 0, top: 0, width: 960, height: 1200 }, "public/images/club/salon-mesas-carambola.webp");
// Mesa en primer plano: se recorta el piso inferior.
await editar(mesa, { left: 0, top: 0, width: 960, height: 1200 }, "public/images/club/mesa-carambola-detalle.webp");
