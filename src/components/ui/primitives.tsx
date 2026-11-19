import type { ReactNode } from "react";
import { cn } from "@/lib/format";
import { Info } from "lucide-react";

export function Contenedor({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

type Tono = "oscuro" | "claro" | "verde" | "carbon2";
const tonos: Record<Tono, string> = {
  oscuro: "bg-carbon text-marfil",
  carbon2: "bg-carbon-2 text-marfil",
  claro: "claro bg-marfil text-carbon",
  verde: "textura-verde text-marfil",
};

export function Seccion({ children, tono = "oscuro", className, id }: { children: ReactNode; tono?: Tono; className?: string; id?: string }) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-28 lg:py-36", tonos[tono], className)}>
      {children}
    </section>
  );
}

export function EncabezadoSeccion({
  eyebrow, titulo, texto, alineacion = "izquierda", className,
}: { eyebrow?: string; titulo: ReactNode; texto?: ReactNode; alineacion?: "izquierda" | "centro"; className?: string }) {
  return (
    <div className={cn("max-w-3xl", alineacion === "centro" && "mx-auto text-center [&_.eyebrow]:justify-center", className)}>
      {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
      <h2 className="text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">{titulo}</h2>
      {texto && <div className="mt-6 text-base leading-relaxed opacity-75 sm:text-lg">{texto}</div>}
    </div>
  );
}

type TonoInsignia = "oro" | "ok" | "alerta" | "error" | "neutro" | "verde";
const insignias: Record<TonoInsignia, string> = {
  oro: "border-oro/40 text-oro bg-oro/10",
  ok: "border-ok/40 text-[#7cc39d] bg-ok/10",
  alerta: "border-alerta/40 text-alerta bg-alerta/10",
  error: "border-error/40 text-[#e09080] bg-error/10",
  neutro: "border-current/20 opacity-80",
  verde: "border-verde/30 text-verde bg-verde/10",
};

export function Insignia({ children, tono = "neutro", className }: { children: ReactNode; tono?: TonoInsignia; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]", insignias[tono], className)}>
      {children}
    </span>
  );
}

/** Aviso honesto: datos pendientes, modo demo, programas propuestos, etc. */
export function Aviso({ children, className, tono = "oro" }: { children: ReactNode; className?: string; tono?: "oro" | "alerta" }) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed",
        tono === "oro" ? "border-oro/30 bg-oro/[0.07]" : "border-alerta/40 bg-alerta/10",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

export function EstadoVacio({ titulo, texto, accion }: { titulo: string; texto?: string; accion?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-current/20 px-6 py-14 text-center">
      <p className="font-display text-2xl">{titulo}</p>
      {texto && <p className="mx-auto mt-3 max-w-md text-sm opacity-70">{texto}</p>}
      {accion && <div className="mt-6 flex justify-center">{accion}</div>}
    </div>
  );
}
