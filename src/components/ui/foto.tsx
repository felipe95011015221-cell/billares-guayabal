import Image from "next/image";
import type { FotoReferencia } from "@/config/images";
import { cn } from "@/lib/format";

/**
 * Fotografía con etiqueta discreta "Foto de referencia" para dejar claro que
 * no corresponde a las instalaciones reales del club.
 */
export function Foto({
  foto, className, sizes = "100vw", priority, etiqueta = true, imgClassName,
}: { foto: FotoReferencia; className?: string; sizes?: string; priority?: boolean; etiqueta?: boolean; imgClassName?: string }) {
  return (
    <figure className={cn("relative overflow-hidden bg-carbon-2", className)}>
      <Image
        src={foto.src}
        alt={foto.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", imgClassName)}
      />
      {etiqueta && (
        <figcaption className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-carbon/70 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-marfil/70 backdrop-blur">
          Foto de referencia
        </figcaption>
      )}
    </figure>
  );
}
