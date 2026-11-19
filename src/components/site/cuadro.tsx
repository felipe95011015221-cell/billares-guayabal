import { cn } from "@/lib/format";
import type { Partido } from "@/lib/types";

const nombreRonda = (r: number, total: number) => {
  const restantes = total - r;
  if (restantes === 0) return "Final";
  if (restantes === 1) return "Semifinal";
  if (restantes === 2) return "Cuartos de final";
  return `Ronda ${r}`;
};

/** Cuadro de eliminación directa. Solo se muestra cuando el club carga partidos reales. */
export function CuadroEliminacion({ partidos }: { partidos: Partido[] }) {
  const rondas = [...new Set(partidos.map((p) => p.ronda))].sort((a, b) => a - b);
  const total = rondas[rondas.length - 1];
  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-6">
        {rondas.map((r) => (
          <div key={r} className="flex w-60 flex-col">
            <p className="mb-4 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-oro">{nombreRonda(r, total)}</p>
            <div className="flex flex-1 flex-col justify-around gap-4">
              {partidos.filter((p) => p.ronda === r).map((p) => (
                <div key={p.id} className="overflow-hidden rounded-xl border border-marfil/10 bg-carbon-2 text-sm">
                  {(["A", "B"] as const).map((lado) => {
                    const nombre = lado === "A" ? p.jugadorA : p.jugadorB;
                    const marcador = lado === "A" ? p.marcadorA : p.marcadorB;
                    const gano = p.ganador === lado;
                    return (
                      <div key={lado} className={cn("flex items-center justify-between gap-3 px-4 py-2.5", lado === "A" && "border-b border-marfil/5", gano && "bg-oro/10")}>
                        <span className={cn("truncate", !nombre && "italic text-marfil/30", gano && "font-semibold text-oro")}>{nombre ?? "Por definir"}</span>
                        <span className={cn("tabular-nums", gano ? "text-oro" : "text-marfil/50")}>{marcador ?? "–"}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
