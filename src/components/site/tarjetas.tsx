import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, Trophy, Users } from "lucide-react";
import { Insignia } from "@/components/ui/primitives";
import { formatoCOP } from "@/lib/format";
import { etiquetaDuracion, formatoFechaCorta, formatoHora, formatoFecha } from "@/lib/time";
import type { ClasePublica, TorneoPublico } from "@/lib/public-data";
import type { EstadoTorneo } from "@/lib/types";

const nombreModalidad = { carambola: "Carambola", pool: "Pool", ambas: "Carambola y pool" } as const;

export function TarjetaClase({ clase, indice }: { clase: ClasePublica; indice: number }) {
  const proxima = clase.sesiones[0];
  return (
    <Link
      href={`/escuela#${clase.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-carbon/10 bg-[#fbf8f1] p-7 transition-all duration-500 ease-[var(--ease-club)] hover:-translate-y-1 hover:border-verde/40 hover:shadow-[0_30px_60px_-30px_rgb(17_23_20/0.35)]"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="font-display text-5xl leading-none text-oro-oscuro/50">{String(indice + 1).padStart(2, "0")}</span>
          <ArrowUpRight className="h-5 w-5 text-carbon/30 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-verde" />
        </div>
        <h3 className="mt-8 font-display text-3xl leading-tight text-carbon">{clase.titulo}</h3>
        <p className="mt-3 text-sm leading-relaxed text-carbon/65">{clase.descripcion}</p>
      </div>
      <div className="mt-8 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Insignia tono="verde">{clase.nivel}</Insignia>
          <Insignia tono="verde">{nombreModalidad[clase.modalidad]}</Insignia>
        </div>
        <div className="flex items-center justify-between border-t border-carbon/10 pt-4 text-xs text-carbon/60">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {etiquetaDuracion(clase.duracionMin)}</span>
          <span>{proxima ? `Próxima: ${formatoFechaCorta(proxima.inicio)}` : "Horarios por publicar"}</span>
        </div>
        {!clase.confirmada && <p className="text-[0.68rem] uppercase tracking-[0.14em] text-oro-oscuro">Programa propuesto · por confirmar</p>}
      </div>
    </Link>
  );
}

export const ESTADOS_TORNEO: Record<EstadoTorneo, { texto: string; tono: "ok" | "alerta" | "neutro" | "error" | "oro" }> = {
  borrador: { texto: "Borrador", tono: "neutro" },
  inscripciones_abiertas: { texto: "Inscripciones abiertas", tono: "ok" },
  inscripciones_cerradas: { texto: "Inscripciones cerradas", tono: "alerta" },
  en_juego: { texto: "En juego", tono: "oro" },
  finalizado: { texto: "Finalizado", tono: "neutro" },
  cancelado: { texto: "Cancelado", tono: "error" },
};

export function TarjetaTorneo({ torneo }: { torneo: TorneoPublico }) {
  const est = ESTADOS_TORNEO[torneo.estado];
  const libres = Math.max(0, torneo.cupos - torneo.inscritos);
  const fecha = new Date(torneo.fecha);
  return (
    <Link
      href={`/torneos/${torneo.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-oro/25 bg-gradient-to-br from-carbon-2 to-carbon p-1 transition-all duration-500 hover:border-oro/60 hover:shadow-[0_30px_80px_-40px_rgb(197_163_106/0.5)]"
    >
      <div className="relative flex h-full flex-col rounded-[0.9rem] border border-marfil/5 p-7 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="text-center">
            <p className="font-display text-6xl leading-none text-oro">{fecha.toLocaleDateString("es-CO", { day: "2-digit", timeZone: "America/Bogota" })}</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.28em] text-marfil/60">
              {fecha.toLocaleDateString("es-CO", { month: "short", year: "numeric", timeZone: "America/Bogota" })}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Insignia tono={est.tono}>{est.texto}</Insignia>
            {torneo.esDemo && <Insignia tono="alerta">Demostración</Insignia>}
          </div>
        </div>
        <p className="eyebrow mt-8">{torneo.modalidad === "carambola" ? "Tres bandas" : "Pool"}</p>
        <h3 className="mt-3 font-display text-3xl leading-tight transition-colors group-hover:text-oro-claro">{torneo.nombre}</h3>
        <p className="mt-3 text-sm text-marfil/60">{torneo.formato}</p>
        <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-marfil/10 pt-6 text-sm">
          <div><dt className="text-[0.65rem] uppercase tracking-[0.16em] text-marfil/45">Inscripción</dt><dd className="mt-1">{formatoCOP(torneo.valorInscripcion)}</dd></div>
          <div><dt className="text-[0.65rem] uppercase tracking-[0.16em] text-marfil/45">Cupos</dt><dd className="mt-1 flex items-center gap-1"><Users className="h-3.5 w-3.5 text-oro" />{libres}/{torneo.cupos}</dd></div>
          <div><dt className="text-[0.65rem] uppercase tracking-[0.16em] text-marfil/45">Hora</dt><dd className="mt-1">{formatoHora(torneo.fecha)}</dd></div>
        </dl>
        <Trophy className="absolute -bottom-6 -right-6 h-40 w-40 text-oro/[0.04]" aria-hidden />
      </div>
    </Link>
  );
}

export function FechaLarga({ iso }: { iso: string }) {
  return (
    <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-oro" />{formatoFecha(iso)}</span>
  );
}
