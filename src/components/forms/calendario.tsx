"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** Calendario táctil (celdas de 44px+), navegable con teclado. Fechas en formato YYYY-MM-DD. */
export function Calendario({ valor, onCambio, minimo, maximo }: { valor: string | null; onCambio: (f: string) => void; minimo: string; maximo: string }) {
  const [mes, setMes] = useState(() => (valor ?? minimo).slice(0, 7));
  const [anio, m] = mes.split("-").map(Number);

  const celdas = useMemo(() => {
    const primero = new Date(Date.UTC(anio, m - 1, 1));
    const desfase = (primero.getUTCDay() + 6) % 7; // lunes = 0
    const diasMes = new Date(Date.UTC(anio, m, 0)).getUTCDate();
    const out: (string | null)[] = Array(desfase).fill(null);
    for (let d = 1; d <= diasMes; d++) out.push(`${mes}-${String(d).padStart(2, "0")}`);
    return out;
  }, [anio, m, mes]);

  const mover = (delta: number) => {
    const d = new Date(Date.UTC(anio, m - 1 + delta, 1));
    setMes(d.toISOString().slice(0, 7));
  };
  const puedeAtras = mes > minimo.slice(0, 7);
  const puedeAdelante = mes < maximo.slice(0, 7);

  return (
    <div className="select-none">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" onClick={() => mover(-1)} disabled={!puedeAtras} aria-label="Mes anterior" className="flex h-11 w-11 items-center justify-center rounded-full border border-marfil/15 transition hover:border-oro disabled:opacity-25">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-display text-2xl capitalize" aria-live="polite">{MESES[m - 1]} {anio}</p>
        <button type="button" onClick={() => mover(1)} disabled={!puedeAdelante} aria-label="Mes siguiente" className="flex h-11 w-11 items-center justify-center rounded-full border border-marfil/15 transition hover:border-oro disabled:opacity-25">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div role="grid" aria-label="Seleccionar fecha" className="grid grid-cols-7 gap-1.5">
        {DIAS.map((d, i) => (
          <div key={i} role="columnheader" className="pb-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-marfil/40">{d}</div>
        ))}
        {celdas.map((f, i) => {
          if (!f) return <div key={`v${i}`} />;
          const deshabilitado = f < minimo || f > maximo;
          const sel = f === valor;
          const hoy = f === minimo;
          return (
            <button
              key={f}
              type="button"
              role="gridcell"
              aria-selected={sel}
              aria-label={f}
              disabled={deshabilitado}
              onClick={() => onCambio(f)}
              className={cn(
                "relative flex aspect-square min-h-11 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                sel ? "bg-oro text-carbon shadow-[0_8px_20px_-8px_rgb(197_163_106/0.7)]" : "hover:bg-marfil/10",
                deshabilitado && "cursor-not-allowed text-marfil/20 hover:bg-transparent",
              )}
            >
              {Number(f.slice(8))}
              {hoy && !sel && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-oro" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
