"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Check, ChevronLeft, Clock3, Loader2, RefreshCw, Share2, AlertTriangle, CircleDot } from "lucide-react";
import { Calendario } from "./calendario";
import { Campo, Casilla, Entrada, Trampa, enviarJson } from "./campos";
import { Boton, estiloBoton } from "@/components/ui/button";
import { IconoWhatsApp } from "@/components/icons";
import { cn, formatoCOP } from "@/lib/format";
import { etiquetaDuracion, etiquetaMinutos, formatoFecha, formatoFechaLocal, formatoHora } from "@/lib/time";
import type { EstadoMesa, Modalidad, ModoReserva } from "@/lib/types";
import { reservaSchema } from "@/lib/validation";
import { enlaceCompartirWhatsApp, enlaceWhatsApp } from "@/lib/whatsapp";

const datosSchema = reservaSchema.pick({ nombre: true, celular: true, correo: true, aceptaDatos: true, website: true });
type DatosIn = z.input<typeof datosSchema>;
type DatosOut = z.output<typeof datosSchema>;

interface Franja { inicioMin: number; libres: number; total: number }
interface MesaEstado { id: string; nombre: string; tarifaHora: number | null; valorEstimado: number | null; estado: EstadoMesa }
interface Resultado { codigo: string; estado: string; inicio: string; fin: string; mesa: string; modalidad: Modalidad; valorEstimado: number | null }

export const ESTADO_MESA_UI: Record<EstadoMesa, { texto: string; clase: string; punto: string }> = {
  disponible: { texto: "Disponible", clase: "border-ok/50 text-[#8fd0ad]", punto: "bg-[#5fbf8a]" },
  pendiente: { texto: "Pendiente de confirmación", clase: "border-alerta/40 text-alerta", punto: "bg-alerta" },
  reservada: { texto: "Reservada", clase: "border-oro/40 text-oro", punto: "bg-oro" },
  ocupada: { texto: "Ocupada", clase: "border-error/40 text-[#e09080]", punto: "bg-error" },
  bloqueada: { texto: "Bloqueada", clase: "border-marfil/20 text-marfil/50", punto: "bg-marfil/40" },
};

const PASOS = ["Modalidad", "Fecha y hora", "Mesa", "Tus datos"] as const;

export function ReservaWizard(props: {
  modalidadInicial?: Modalidad;
  duraciones: number[];
  hoy: string;
  maximo: string;
  modoReserva: ModoReserva;
  politica: string;
}) {
  const [paso, setPaso] = useState(props.modalidadInicial ? 1 : 0);
  const [modalidad, setModalidad] = useState<Modalidad | null>(props.modalidadInicial ?? null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [duracion, setDuracion] = useState(props.duraciones.includes(120) ? 120 : props.duraciones[0]);
  const [inicio, setInicio] = useState<number | null>(null);
  const [mesaId, setMesaId] = useState<string | null>(null);

  const [franjas, setFranjas] = useState<Franja[] | null>(null);
  const [mesas, setMesas] = useState<MesaEstado[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const irA = (p: number) => {
    setPaso(p);
    setError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cargarFranjas = useCallback(async () => {
    if (!modalidad || !fecha) return;
    setCargando(true);
    setError(null);
    try {
      const r = await fetch(`/api/disponibilidad?modalidad=${modalidad}&fecha=${fecha}&duracion=${duracion}`, { cache: "no-store" });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setFranjas(j.data.franjas);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos consultar la disponibilidad.");
      setFranjas([]);
    } finally {
      setCargando(false);
    }
  }, [modalidad, fecha, duracion]);

  const cargarMesas = useCallback(async () => {
    if (!modalidad || !fecha || inicio === null) return;
    setCargando(true);
    setError(null);
    try {
      const r = await fetch(`/api/disponibilidad?modalidad=${modalidad}&fecha=${fecha}&duracion=${duracion}&inicio=${inicio}`, { cache: "no-store" });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      setMesas(j.data.mesas);
      setMesaId((actual) => (j.data.mesas.some((m: MesaEstado) => m.id === actual && m.estado === "disponible") ? actual : null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos consultar las mesas.");
    } finally {
      setCargando(false);
    }
  }, [modalidad, fecha, duracion, inicio]);

  // Cambiar fecha, duración o modalidad invalida la hora elegida.
  useEffect(() => {
    setInicio(null);
    setFranjas(null);
  }, [fecha, duracion, modalidad]);

  useEffect(() => {
    if (paso === 1 && fecha) void cargarFranjas();
  }, [paso, fecha, cargarFranjas]);

  useEffect(() => {
    if (paso === 2) void cargarMesas();
  }, [paso, cargarMesas]);

  const mesaSel = mesas?.find((m) => m.id === mesaId) ?? null;

  const form = useForm<DatosIn, unknown, DatosOut>({
    resolver: zodResolver(datosSchema),
    defaultValues: { nombre: "", celular: "", correo: "", website: "" },
  });

  const enviar = form.handleSubmit(async (d) => {
    if (!modalidad || !fecha || inicio === null || !mesaId) return;
    setError(null);
    const r = await enviarJson<Resultado>("/api/reservas", { ...d, modalidad, fecha, inicio, duracion, mesaId });
    if (r.ok) {
      setResultado(r.data);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setError(r.error);
    if (r.campos) Object.entries(r.campos).forEach(([k, v]) => form.setError(k as keyof DatosIn, { message: v }));
    if (/tomar esta mesa|disponible/i.test(r.error)) {
      // La mesa se ocupó mientras el usuario llenaba el formulario: volvemos a consultar.
      await cargarMesas();
      setPaso(2);
    }
  });

  const resumen = useMemo(
    () => ({
      modalidad: modalidad === "pool" ? "Pool" : "Carambola a tres bandas",
      fecha: fecha ? formatoFechaLocal(fecha) : "",
      hora: inicio !== null ? `${etiquetaMinutos(inicio)} – ${etiquetaMinutos(inicio + duracion)}` : "",
    }),
    [modalidad, fecha, inicio, duracion],
  );

  if (resultado) return <ConfirmacionReserva r={resultado} topRef={topRef} />;

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Indicador de pasos */}
      <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Pasos de la reserva">
        {PASOS.map((p, i) => (
          <li key={p}>
            <button
              type="button"
              disabled={i > paso}
              onClick={() => i < paso && irA(i)}
              className="w-full text-left disabled:cursor-default"
              aria-current={i === paso ? "step" : undefined}
            >
              <span className={cn("block h-0.5 rounded-full transition-colors duration-500", i <= paso ? "bg-oro" : "bg-marfil/15")} />
              <span className={cn("mt-3 hidden text-[0.65rem] font-semibold uppercase tracking-[0.18em] sm:block", i === paso ? "text-oro" : "text-marfil/45")}>
                {String(i + 1).padStart(2, "0")} · {p}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="-mt-6 mb-8 text-[0.68rem] uppercase tracking-[0.18em] text-oro sm:hidden">Paso {paso + 1} de 4 · {PASOS[paso]}</p>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div key={paso} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              {paso === 0 && (
                <div>
                  <h2 className="font-display text-4xl">¿Qué vas a jugar?</h2>
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {([
                      { id: "carambola", t: "Carambola", s: "Tres bandas · mesa sin buchacas" },
                      { id: "pool", t: "Pool", s: "Mesa con buchacas · bola 8 y bola 9" },
                    ] as const).map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => { setModalidad(o.id); irA(1); }}
                        className={cn(
                          "group rounded-2xl border p-7 text-left transition-all duration-300 hover:-translate-y-0.5",
                          modalidad === o.id ? "border-oro bg-oro/10" : "border-marfil/15 hover:border-oro/60",
                        )}
                      >
                        <CircleDot className="h-6 w-6 text-oro" />
                        <span className="mt-6 block font-display text-3xl">{o.t}</span>
                        <span className="mt-1 block text-sm text-marfil/60">{o.s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paso === 1 && (
                <div className="space-y-10">
                  <div className="grid gap-10 md:grid-cols-2">
                    <div>
                      <h2 className="mb-6 font-display text-3xl">Elige la fecha</h2>
                      <Calendario valor={fecha} onCambio={setFecha} minimo={props.hoy} maximo={props.maximo} />
                    </div>
                    <div>
                      <h2 className="mb-6 font-display text-3xl">Duración</h2>
                      <div className="grid grid-cols-2 gap-2">
                        {props.duraciones.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDuracion(d)}
                            aria-pressed={duracion === d}
                            className={cn("h-14 rounded-xl border text-sm font-semibold transition", duracion === d ? "border-oro bg-oro text-carbon" : "border-marfil/15 hover:border-oro/60")}
                          >
                            {etiquetaDuracion(d)}
                          </button>
                        ))}
                      </div>
                      <p className="mt-6 text-sm text-marfil/55">Las franjas se calculan en hora de Medellín (America/Bogotá).</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-5 flex items-end justify-between gap-4">
                      <h2 className="font-display text-3xl">Hora de inicio</h2>
                      {fecha && (
                        <button type="button" onClick={() => void cargarFranjas()} className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-marfil/55 hover:text-oro">
                          <RefreshCw className={cn("h-3.5 w-3.5", cargando && "animate-spin")} /> Actualizar
                        </button>
                      )}
                    </div>
                    {!fecha ? (
                      <p className="rounded-xl border border-dashed border-marfil/15 p-6 text-sm text-marfil/55">Selecciona una fecha para ver las horas disponibles.</p>
                    ) : cargando && !franjas ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-marfil/5" />)}</div>
                    ) : franjas && franjas.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-marfil/15 p-6 text-sm text-marfil/55">No hay horarios disponibles para esta fecha y duración. Prueba otro día o una duración menor.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                        {franjas?.map((f) => (
                          <button
                            key={f.inicioMin}
                            type="button"
                            disabled={f.libres === 0}
                            onClick={() => { setInicio(f.inicioMin); setMesas(null); irA(2); }}
                            className={cn(
                              "flex h-14 flex-col items-center justify-center rounded-xl border text-sm transition",
                              inicio === f.inicioMin ? "border-oro bg-oro text-carbon" : "border-marfil/15 hover:border-oro/60",
                              f.libres === 0 && "cursor-not-allowed border-marfil/5 text-marfil/25 line-through hover:border-marfil/5",
                            )}
                          >
                            <span className="font-semibold">{etiquetaMinutos(f.inicioMin)}</span>
                            <span className="text-[0.6rem] uppercase tracking-[0.1em] opacity-60">{f.libres === 0 ? "Sin mesas" : `${f.libres} libre${f.libres > 1 ? "s" : ""}`}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paso === 2 && (
                <div>
                  <div className="flex items-end justify-between gap-4">
                    <h2 className="font-display text-3xl sm:text-4xl">Escoge tu mesa</h2>
                    <button type="button" onClick={() => void cargarMesas()} className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-marfil/55 hover:text-oro">
                      <RefreshCw className={cn("h-3.5 w-3.5", cargando && "animate-spin")} /> Actualizar
                    </button>
                  </div>
                  <Leyenda />
                  {!mesas ? (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-marfil/5" />)}</div>
                  ) : mesas.length === 0 ? (
                    <p className="mt-8 rounded-xl border border-dashed border-marfil/15 p-6 text-sm text-marfil/55">No hay mesas configuradas para esta modalidad.</p>
                  ) : (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {mesas.map((m) => {
                        const ui = ESTADO_MESA_UI[m.estado];
                        const libre = m.estado === "disponible";
                        const sel = mesaId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            disabled={!libre}
                            onClick={() => setMesaId(m.id)}
                            aria-pressed={sel}
                            className={cn(
                              "group relative overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300",
                              sel ? "border-oro bg-oro/10 shadow-[0_20px_40px_-25px_rgb(197_163_106/0.8)]" : libre ? "border-marfil/15 hover:-translate-y-0.5 hover:border-oro/60" : "cursor-not-allowed border-marfil/10 opacity-55",
                            )}
                          >
                            <MiniMesa modalidad={modalidad!} activa={libre} />
                            <span className="mt-5 flex items-center justify-between">
                              <span className="font-display text-2xl">{m.nombre}</span>
                              {sel && <Check className="h-5 w-5 text-oro" />}
                            </span>
                            <span className={cn("mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em]", ui.clase)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", ui.punto)} /> {ui.texto}
                            </span>
                            <span className="mt-3 block text-xs text-marfil/55">{m.tarifaHora == null ? "Tarifa por confirmar" : `${formatoCOP(m.tarifaHora)} / hora`}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Boton type="button" variante="fantasma" onClick={() => irA(1)}><ChevronLeft className="h-4 w-4" />Cambiar hora</Boton>
                    <Boton type="button" disabled={!mesaId} onClick={() => irA(3)}>Continuar</Boton>
                  </div>
                </div>
              )}

              {paso === 3 && (
                <form onSubmit={enviar} noValidate className="space-y-6">
                  <h2 className="font-display text-3xl sm:text-4xl">Tus datos</h2>
                  <p className="text-sm text-marfil/60">Solo los usamos para gestionar tu reserva y contactarte sobre ella.</p>
                  <Trampa {...form.register("website")} />
                  <Campo etiqueta="Nombre completo" id="nombre" error={form.formState.errors.nombre?.message}>
                    <Entrada id="nombre" autoComplete="name" invalido={!!form.formState.errors.nombre} {...form.register("nombre")} />
                  </Campo>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Campo etiqueta="Celular" id="celular" error={form.formState.errors.celular?.message} ayuda="10 dígitos. Te contactaremos por aquí.">
                      <Entrada id="celular" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="300 123 4567" invalido={!!form.formState.errors.celular} {...form.register("celular")} />
                    </Campo>
                    <Campo etiqueta="Correo electrónico" id="correo" error={form.formState.errors.correo?.message}>
                      <Entrada id="correo" type="email" autoComplete="email" inputMode="email" invalido={!!form.formState.errors.correo} {...form.register("correo")} />
                    </Campo>
                  </div>
                  <Casilla
                    id="aceptaDatos"
                    error={form.formState.errors.aceptaDatos?.message}
                    etiqueta={<>Autorizo el tratamiento de mis datos personales para gestionar esta reserva, según la <Link href="/privacidad" className="text-oro underline underline-offset-2" target="_blank">política de datos</Link> (Ley 1581 de 2012).</>}
                    {...form.register("aceptaDatos")}
                  />
                  <p className="rounded-xl border border-marfil/10 bg-marfil/[0.03] p-4 text-xs leading-relaxed text-marfil/60">{props.politica}</p>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <Boton type="button" variante="fantasma" onClick={() => irA(2)}><ChevronLeft className="h-4 w-4" />Cambiar mesa</Boton>
                    <Boton type="submit" tamaño="lg" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Verificando…</> : props.modoReserva === "manual" ? "Enviar solicitud" : "Confirmar reserva"}
                    </Boton>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-error/40 bg-error/10 p-4 text-sm">
              <AlertTriangle className="h-5 w-5 shrink-0 text-[#e09080]" /> {error}
            </div>
          )}
        </div>

        {/* Resumen lateral */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 rounded-2xl border border-marfil/10 bg-carbon-2 p-7">
            <p className="eyebrow">Tu reserva</p>
            <dl className="mt-6 space-y-4 text-sm">
              <Fila t="Modalidad" v={modalidad ? resumen.modalidad : "—"} />
              <Fila t="Fecha" v={fecha ? resumen.fecha : "—"} />
              <Fila t="Horario" v={inicio !== null ? resumen.hora : "—"} />
              <Fila t="Duración" v={etiquetaDuracion(duracion)} />
              <Fila t="Mesa" v={mesaSel?.nombre ?? "—"} />
              <Fila t="Valor estimado" v={mesaSel ? formatoCOP(mesaSel.valorEstimado, "Tarifa por confirmar") : "—"} />
            </dl>
            <div className="linea-oro my-6" />
            <p className="flex gap-2 text-xs leading-relaxed text-marfil/55">
              <Clock3 className="h-4 w-4 shrink-0 text-oro" />
              {props.modoReserva === "manual"
                ? "Tu solicitud quedará pendiente hasta que el club la confirme."
                : "La disponibilidad se verifica de nuevo al confirmar."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Fila({ t, v }: { t: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-marfil/45">{t}</dt>
      <dd className="text-right first-letter:uppercase">{v}</dd>
    </div>
  );
}

function Leyenda() {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2" aria-label="Estados de las mesas">
      {Object.entries(ESTADO_MESA_UI).map(([k, v]) => (
        <li key={k} className="flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.12em] text-marfil/55">
          <span className={cn("h-2 w-2 rounded-full", v.punto)} />{v.texto}
        </li>
      ))}
    </ul>
  );
}

/** Ilustración mínima de la mesa: con buchacas (pool) o sin ellas (carambola). */
function MiniMesa({ modalidad, activa }: { modalidad: Modalidad; activa: boolean }) {
  return (
    <svg viewBox="0 0 120 64" className="h-14 w-auto" aria-hidden>
      <rect x="2" y="2" width="116" height="60" rx="6" fill="#3a2a1d" />
      <rect x="9" y="9" width="102" height="46" rx="2" fill={activa ? "#164b37" : "#2a332e"} />
      {modalidad === "pool" && [[9, 9], [60, 8], [111, 9], [9, 55], [60, 56], [111, 55]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.4" fill="#0b0f0d" />)}
      {modalidad === "carambola" ? (
        <><circle cx="40" cy="30" r="3.2" fill="#f2ebdd" /><circle cx="78" cy="22" r="3.2" fill="#e8c44a" /><circle cx="70" cy="40" r="3.2" fill="#c4453a" /></>
      ) : (
        <><circle cx="38" cy="32" r="3.2" fill="#f2ebdd" /><circle cx="80" cy="32" r="3.2" fill="#c4453a" /><circle cx="86" cy="28" r="3.2" fill="#e8c44a" /><circle cx="86" cy="36" r="3.2" fill="#1f3c8a" /></>
      )}
    </svg>
  );
}

function ConfirmacionReserva({ r, topRef }: { r: Resultado; topRef: React.RefObject<HTMLDivElement | null> }) {
  const pendiente = r.estado === "pendiente";
  const texto =
    `Reserva Billares Guayabal\nCódigo: ${r.codigo}\nEstado: ${pendiente ? "Solicitud pendiente de confirmación" : "Confirmada"}\n` +
    `${r.modalidad === "pool" ? "Pool" : "Carambola"} · ${r.mesa}\n${formatoFecha(r.inicio)}, ${formatoHora(r.inicio)} – ${formatoHora(r.fin)}`;
  return (
    <div ref={topRef} className="scroll-mt-28">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mx-auto max-w-2xl rounded-3xl border border-oro/30 bg-carbon-2 p-8 text-center sm:p-12">
        <div className={cn("mx-auto flex h-16 w-16 items-center justify-center rounded-full", pendiente ? "bg-alerta/15 text-alerta" : "bg-ok/15 text-[#8fd0ad]")}>
          {pendiente ? <Clock3 className="h-8 w-8" /> : <Check className="h-8 w-8" />}
        </div>
        <h2 className="mt-6 font-display text-4xl sm:text-5xl">{pendiente ? "Solicitud pendiente de confirmación" : "Reserva confirmada"}</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-marfil/65">
          {pendiente
            ? "Recibimos tu solicitud. Aún NO está aprobada: el club la revisará y te contactará por WhatsApp o llamada para confirmarla."
            : "Tu mesa quedó reservada. Te esperamos."}
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-dashed border-oro/40 p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-marfil/50">Tu código</p>
          <p className="mt-2 font-mono text-3xl tracking-[0.18em] text-oro">{r.codigo}</p>
        </div>
        <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4 text-left text-sm">
          <div><dt className="text-marfil/45">Mesa</dt><dd>{r.mesa} · {r.modalidad === "pool" ? "Pool" : "Carambola"}</dd></div>
          <div><dt className="text-marfil/45">Valor estimado</dt><dd>{formatoCOP(r.valorEstimado, "Por confirmar")}</dd></div>
          <div className="col-span-2"><dt className="text-marfil/45">Fecha y hora</dt><dd className="first-letter:uppercase">{formatoFecha(r.inicio)} · {formatoHora(r.inicio)} – {formatoHora(r.fin)}</dd></div>
        </dl>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <a href={enlaceCompartirWhatsApp(texto)} target="_blank" rel="noopener noreferrer" className={estiloBoton("contorno", "md")}><Share2 className="h-4 w-4" />Compartir</a>
          <a href={enlaceWhatsApp("reservas", texto)} target="_blank" rel="noopener noreferrer" className={estiloBoton("oro", "md")}><IconoWhatsApp className="h-4 w-4" />Avisar al club</a>
        </div>
        <Link href="/reservas/consultar" className="mt-6 inline-block text-xs uppercase tracking-[0.16em] text-marfil/55 hover:text-oro">Consultar mis reservas →</Link>
      </motion.div>
    </div>
  );
}
