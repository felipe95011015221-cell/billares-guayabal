"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/format";
import type { FotoGaleria } from "@/lib/types";

const FILTROS = [
  { id: "todas", t: "Todas" },
  { id: "carambola", t: "Carambola" },
  { id: "pool", t: "Pool" },
  { id: "ambiente", t: "Ambiente" },
  { id: "detalle", t: "Detalles" },
] as const;

/** Galería masonry (columnas CSS) con filtros y lightbox accesible por teclado. */
export function Galeria({ fotos }: { fotos: FotoGaleria[] }) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("todas");
  const [abierta, setAbierta] = useState<number | null>(null);
  const visibles = fotos.filter((f) => filtro === "todas" || f.categoria === filtro);

  const mover = useCallback((d: number) => setAbierta((i) => (i === null ? null : (i + d + visibles.length) % visibles.length)), [visibles.length]);

  useEffect(() => {
    if (abierta === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(null);
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [abierta, mover]);

  const actual = abierta !== null ? visibles[abierta] : null;

  return (
    <>
      <div role="tablist" aria-label="Filtrar por modalidad" className="-mx-5 mb-10 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTROS.map((f) => {
          const n = f.id === "todas" ? fotos.length : fotos.filter((x) => x.categoria === f.id).length;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={cn("shrink-0 rounded-full border px-5 py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition", filtro === f.id ? "border-oro bg-oro text-carbon" : "border-marfil/15 text-marfil/70 hover:border-oro/50")}
            >
              {f.t} <span className="opacity-60">({n})</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-marfil/15 p-12 text-center text-marfil/55">Aún no hay fotos en esta categoría. Pronto publicaremos fotografías reales del club.</p>
      ) : (
        <motion.ul layout className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
          <AnimatePresence mode="popLayout">
            {visibles.map((f, i) => (
              <motion.li key={f.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.45 }} className="break-inside-avoid">
                <button type="button" onClick={() => setAbierta(i)} className="group relative block w-full overflow-hidden rounded-sm" aria-label={`Ampliar: ${f.alt}`}>
                  <Image src={f.src} alt={f.alt} width={f.ancho} height={f.alto} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="h-auto w-full transition-transform duration-[1.2s] ease-[var(--ease-club)] group-hover:scale-[1.04]" />
                  <span className="absolute inset-0 bg-carbon/0 transition-colors duration-500 group-hover:bg-carbon/30" />
                  {f.esReferencia && <span className="absolute bottom-2 right-2 rounded-full bg-carbon/70 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] text-marfil/70">Foto de referencia</span>}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <AnimatePresence>
        {actual && (
          <motion.div role="dialog" aria-modal="true" aria-label={actual.alt} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-carbon/95 p-4 backdrop-blur" onClick={() => setAbierta(null)}>
            <button type="button" onClick={() => setAbierta(null)} aria-label="Cerrar" className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-marfil/20 text-marfil hover:border-oro"><X className="h-5 w-5" /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); mover(-1); }} aria-label="Anterior" className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-marfil/20 text-marfil hover:border-oro sm:flex"><ChevronLeft /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); mover(1); }} aria-label="Siguiente" className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-marfil/20 text-marfil hover:border-oro sm:flex"><ChevronRight /></button>
            <motion.figure key={actual.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }} className="max-h-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <Image src={actual.src} alt={actual.alt} width={actual.ancho} height={actual.alto} sizes="90vw" className="mx-auto max-h-[80vh] w-auto rounded-sm object-contain" />
              <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-marfil/70">
                <span>{actual.alt}</span>
                <span className="text-xs text-marfil/45">
                  {actual.esReferencia ? "Foto de referencia · " : ""}
                  {actual.credito && (actual.urlCredito ? <a href={actual.urlCredito} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{actual.credito}</a> : actual.credito)}
                </span>
              </figcaption>
              <div className="mt-4 flex justify-center gap-3 sm:hidden">
                <button type="button" onClick={() => mover(-1)} aria-label="Anterior" className="flex h-12 w-12 items-center justify-center rounded-full border border-marfil/20"><ChevronLeft /></button>
                <button type="button" onClick={() => mover(1)} aria-label="Siguiente" className="flex h-12 w-12 items-center justify-center rounded-full border border-marfil/20"><ChevronRight /></button>
              </div>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
