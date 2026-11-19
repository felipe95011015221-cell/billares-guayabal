import Link from "next/link";
import { estadoInscripcionTorneo, generarCuadro, guardarResultado, guardarTorneo } from "../../acciones";
import { BotonEnviar, FormAccion } from "@/components/admin/form-accion";
import { Etq, Panel, TituloAdmin, Vacio, campoAdmin } from "@/components/admin/ui";
import { ESTADOS_TORNEO } from "@/components/site/tarjetas";
import { Insignia } from "@/components/ui/primitives";
import { repoOError } from "@/lib/data";
import { formatoFechaCorta, hoyBogota, sumarDias } from "@/lib/time";
import type { Torneo } from "@/lib/types";

export default async function AdminTorneos() {
  const r = repoOError();
  const torneos = await r.listarTorneos();
  const datos = await Promise.all(torneos.map(async (t) => ({ t, ins: await r.listarInscripcionesTorneo(t.id), partidos: await r.listarPartidos(t.id) })));

  return (
    <>
      <TituloAdmin titulo="Torneos" texto="Un torneo solo aparece en la web cuando está marcado como “Publicado” y no está en borrador." />
      <div className="space-y-6">
        {datos.length === 0 && <Vacio>Aún no hay torneos. Cree el primero abajo.</Vacio>}
        {datos.map(({ t, ins, partidos }) => {
          const est = ESTADOS_TORNEO[t.estado];
          return (
            <Panel key={t.id} titulo={t.nombre} acciones={
              <div className="flex flex-wrap gap-2">
                <Insignia tono={est.tono}>{est.texto}</Insignia>
                {t.publicado ? <Insignia tono="ok">Publicado</Insignia> : <Insignia>No publicado</Insignia>}
                {t.esDemo && <Insignia tono="alerta">Demo</Insignia>}
              </div>
            }>
              <p className="text-sm text-marfil/55"><span>{formatoFechaCorta(t.fecha)}</span> · {t.formato} · {ins.filter((i) => i.estado !== "cancelada").length}/{t.cupos} inscritos
                {t.publicado && <> · <Link href={`/torneos/${t.slug}`} target="_blank" className="text-oro">ver en la web</Link></>}
              </p>
              <details className="mt-4"><summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-marfil/50 hover:text-oro">Editar torneo</summary><div className="mt-4"><FormTorneo t={t} /></div></details>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-marfil/50">Inscritos</h3>
                  {ins.length === 0 ? <p className="mt-2 text-sm text-marfil/45">Sin inscritos.</p> : (
                    <ul className="mt-2 divide-y divide-marfil/5">
                      {ins.map((i) => (
                        <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                          <span>{i.nombre} <span className="text-xs text-marfil/40">{i.celular}{i.documento ? ` · ${i.documento}` : ""}</span></span>
                          <span className="flex items-center gap-2">
                            <Insignia tono={i.estado === "confirmada" ? "ok" : i.estado === "cancelada" ? "error" : "alerta"}>{i.estado}</Insignia>
                            {i.estado !== "confirmada" && <FormAccion accion={estadoInscripcionTorneo}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="estado" value="confirmada" /><BotonEnviar variante="sutil">Confirmar</BotonEnviar></FormAccion>}
                            {i.estado !== "cancelada" && <FormAccion accion={estadoInscripcionTorneo} confirmar="¿Cancelar inscripción?"><input type="hidden" name="id" value={i.id} /><input type="hidden" name="estado" value="cancelada" /><BotonEnviar variante="peligro">Cancelar</BotonEnviar></FormAccion>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-marfil/50">Cuadro y resultados</h3>
                    <FormAccion accion={generarCuadro} confirmar={partidos.length ? "Esto reemplaza el cuadro y los resultados actuales. ¿Continuar?" : undefined}>
                      <input type="hidden" name="torneoId" value={t.id} />
                      <BotonEnviar variante="sutil">{partidos.length ? "Regenerar cuadro" : "Generar cuadro"}</BotonEnviar>
                    </FormAccion>
                  </div>
                  {partidos.length === 0 ? <p className="mt-2 text-sm text-marfil/45">Se genera con los inscritos confirmados.</p> : (
                    <ul className="mt-3 space-y-2">
                      {partidos.map((p) => (
                        <li key={p.id}>
                          <FormAccion accion={guardarResultado} className="flex flex-wrap items-center gap-2 rounded-lg border border-marfil/10 p-2 text-sm">
                            <input type="hidden" name="id" value={p.id} /><input type="hidden" name="torneoId" value={t.id} />
                            <span className="w-8 text-xs text-marfil/40">R{p.ronda}</span>
                            <span className="min-w-24 flex-1 truncate">{p.jugadorA ?? "—"}</span>
                            <input type="number" name="marcadorA" min={0} defaultValue={p.marcadorA ?? ""} aria-label="Marcador A" className={`${campoAdmin} !w-16`} disabled={!p.jugadorA || !p.jugadorB} />
                            <input type="number" name="marcadorB" min={0} defaultValue={p.marcadorB ?? ""} aria-label="Marcador B" className={`${campoAdmin} !w-16`} disabled={!p.jugadorA || !p.jugadorB} />
                            <span className="min-w-24 flex-1 truncate text-right">{p.jugadorB ?? "—"}</span>
                            {p.jugadorA && p.jugadorB && <BotonEnviar variante="sutil">OK</BotonEnviar>}
                          </FormAccion>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
        <Panel titulo="Nuevo torneo"><FormTorneo /></Panel>
      </div>
    </>
  );
}

function FormTorneo({ t }: { t?: Torneo }) {
  const local = t ? new Date(new Date(t.fecha).getTime() - 5 * 3600_000).toISOString() : null;
  return (
    <FormAccion accion={guardarTorneo} className="space-y-3">
      {t && <input type="hidden" name="id" value={t.id} />}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2"><Etq>Nombre</Etq><input name="nombre" defaultValue={t?.nombre} required className={campoAdmin} /></div>
        <div><Etq>Fecha</Etq><input type="date" name="fecha" defaultValue={local?.slice(0, 10) ?? sumarDias(hoyBogota(), 30)} required className={campoAdmin} /></div>
        <div><Etq>Hora</Etq><input type="time" name="hora" defaultValue={local?.slice(11, 16) ?? "14:00"} className={campoAdmin} /></div>
        <div><Etq>Disciplina</Etq><select name="modalidad" defaultValue={t?.modalidad ?? "carambola"} className={campoAdmin}><option value="carambola">Carambola tres bandas</option><option value="pool">Pool</option></select></div>
        <div><Etq>Cupos</Etq><input type="number" name="cupos" min={2} defaultValue={t?.cupos ?? 16} className={campoAdmin} /></div>
        <div><Etq>Inscripción (COP)</Etq><input type="number" name="valorInscripcion" min={0} step={1000} defaultValue={t?.valorInscripcion ?? ""} placeholder="Por confirmar" className={campoAdmin} /></div>
        <div><Etq>Estado</Etq>
          <select name="estado" defaultValue={t?.estado ?? "borrador"} className={campoAdmin}>{Object.entries(ESTADOS_TORNEO).map(([k, v]) => <option key={k} value={k}>{v.texto}</option>)}</select>
        </div>
        <div className="sm:col-span-4"><Etq>Formato</Etq><input name="formato" defaultValue={t?.formato} placeholder="Ej. Eliminación directa a 25 carambolas" className={campoAdmin} /></div>
        <div className="sm:col-span-2"><Etq>Requisitos</Etq><textarea name="requisitos" defaultValue={t?.requisitos} className={`${campoAdmin} min-h-20`} /></div>
        <div className="sm:col-span-2"><Etq>Descripción</Etq><textarea name="descripcion" defaultValue={t?.descripcion} className={`${campoAdmin} min-h-20`} /></div>
      </div>
      <div className="flex items-center gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="publicado" defaultChecked={t?.publicado} className="accent-[#c5a36a]" />Publicado (aprobado por el club)</label>
        <BotonEnviar>{t ? "Guardar" : "Crear torneo"}</BotonEnviar>
      </div>
    </FormAccion>
  );
}
