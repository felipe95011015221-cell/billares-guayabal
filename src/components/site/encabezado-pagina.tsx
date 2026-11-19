import Image from "next/image";
import type { ReactNode } from "react";
import type { FotoReferencia } from "@/config/images";
import { Contenedor } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";

/** Cabecera editorial para páginas internas. */
export function EncabezadoPagina({ eyebrow, titulo, texto, foto, children }: { eyebrow: string; titulo: ReactNode; texto?: ReactNode; foto?: FotoReferencia; children?: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-carbon pb-16 pt-36 sm:pb-24 sm:pt-44">
      {foto && (
        <>
          <Image src={foto.src} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-carbon via-carbon/80 to-carbon/50" />
          <span className="pointer-events-none absolute bottom-3 right-4 text-[0.58rem] uppercase tracking-[0.16em] text-marfil/40">Foto de referencia</span>
        </>
      )}
      <Contenedor>
        <Reveal>
          <p className="eyebrow mb-6">{eyebrow}</p>
          <h1 className="max-w-4xl font-display text-5xl leading-[0.95] sm:text-7xl lg:text-8xl">{titulo}</h1>
          {texto && <div className="mt-8 max-w-2xl text-base leading-relaxed text-marfil/70 sm:text-lg">{texto}</div>}
          {children}
        </Reveal>
      </Contenedor>
    </section>
  );
}
