import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function TituloAdmin({ titulo, texto, acciones }: { titulo: string; texto?: string; acciones?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-4xl sm:text-5xl">{titulo}</h1>
        {texto && <p className="mt-2 max-w-2xl text-sm text-marfil/55">{texto}</p>}
      </div>
      {acciones}
    </div>
  );
}

export function Panel({ titulo, children, className, acciones }: { titulo?: string; children: ReactNode; className?: string; acciones?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-marfil/10 bg-carbon-2 p-5 sm:p-6", className)}>
      {(titulo || acciones) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {titulo && <h2 className="font-display text-2xl">{titulo}</h2>}
          {acciones}
        </div>
      )}
      {children}
    </section>
  );
}

export function Etq({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-marfil/50">{children}</label>;
}

export const campoAdmin = "campo !min-h-10 !py-2 text-sm";

export function Kpi({ etiqueta, valor, detalle }: { etiqueta: string; valor: ReactNode; detalle?: string }) {
  return (
    <div className="rounded-2xl border border-marfil/10 bg-carbon-2 p-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-marfil/50">{etiqueta}</p>
      <p className="mt-3 font-display text-4xl text-oro">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-marfil/45">{detalle}</p>}
    </div>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-dashed border-marfil/15 p-6 text-center text-sm text-marfil/45">{children}</p>;
}
