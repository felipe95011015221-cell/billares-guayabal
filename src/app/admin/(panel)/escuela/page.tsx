import { actualizarCupos, crearSesion, eliminarSesion, estadoInscripcionClase, guardarClase, guardarInstructor } from "../../acciones";
import { BotonEnviar, FormAccion } from "@/components/admin/form-accion";
import { Etq, Panel, TituloAdmin, Vacio, campoAdmin } from "@/components/admin/ui";
import { Insignia } from "@/components/ui/primitives";
import { repoOError } from "@/lib/data";
import { formatoFechaCorta, formatoHora, hoyBogota, sumarDias } from "@/lib/time";
import type { Clase, Instructor } from "@/lib/types";

const NIVELES = ["Iniciación", "Básico", "Intermedio", "Avanzado", "Todos los niveles"];

export default async function AdminEscuela() {
  const r = repoOError();
  const [clases, sesiones, inscripciones, instructores] = await Promise.all([r.listarClases(), r.listarSesiones(), r.listarInscripcionesClase(), r.listarInstructores()]);
  const ahora = Date.now();

  return (
    <>
      <TituloAdmin titulo="Escuela" texto="Programas, horarios, cupos, instructores y alumnos. Marque una clase como “confirmada” solo cuando el club la apruebe." />
      <div className="grid gap-6 2xl:grid-cols-3">
        <div className="space-y-6 2xl:col-span-2">
          {clases.map((c) => {
            const ses = sesiones.filter((s) => s.claseId === c.id);
            return (
              <Panel key={c.id} titulo={c.titulo} acciones={<div className="flex gap-2">{c.confirmada ? <Insignia tono="ok">Confirmada</Insignia> : <Insignia tono="alerta">Propuesta</Insignia>}{!c.activa && <Insignia>Inactiva</Insignia>}</div>}>
                <details>
                  <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-marfil/50 hover:text-oro">Editar programa</summary>
                  <div className="mt-4"><FormClase c={c} instructores={instructores} /></div>
                </details>
                <h3 className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-marfil/50">Horarios y cupos</h3>
                {ses.length === 0 ? <p className="mt-2 text-sm text-marfil/45">Sin horarios.</p> : (
                  <ul className="mt-2 divide-y divide-marfil/5">
                    {ses.map((s) => {
                      const ins = inscripciones.filter((i) => i.sesionId === s.id && i.estado !== "cancelada");
                      const pasada = new Date(s.inicio).getTime() < ahora;
                      return (
                        <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                          <span className={pasada ? "text-marfil/35" : ""}><span>{formatoFechaCorta(s.inicio)}</span> · {formatoHora(s.inicio)} · {ins.length}/{s.cupos} inscritos</span>
                          <span className="flex items-center gap-2">
                            <FormAccion accion={actualizarCupos} className="flex items-center gap-1">
                              <input type="hidden" name="id" value={s.id} />
                              <input type="number" name="cupos" min={1} defaultValue={s.cupos} className={`${campoAdmin} !w-20`} aria-label="Cupos" />
                              <BotonEnviar variante="sutil">Cupos</BotonEnviar>
                            </FormAccion>
                            <FormAccion accion={eliminarSesion} confirmar="¿Eliminar este horario y sus inscripciones?"><input type="hidden" name="id" value={s.id} /><BotonEnviar variante="peligro">Eliminar</BotonEnviar></FormAccion>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <FormAccion accion={crearSesion} className="mt-4 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="claseId" value={c.id} />
                  <div><Etq>Fecha</Etq><input type="date" name="fecha" defaultValue={sumarDias(hoyBogota(), 7)} className={campoAdmin} required /></div>
                  <div><Etq>Hora</Etq><input type="time" name="hora" defaultValue="18:00" className={campoAdmin} required /></div>
                  <div><Etq>Cupos</Etq><input type="number" name="cupos" min={1} defaultValue={6} className={`${campoAdmin} !w-20`} /></div>
                  <BotonEnviar>Agregar horario</BotonEnviar>
                </FormAccion>
              </Panel>
            );
          })}
          <Panel titulo="Nuevo programa"><FormClase instructores={instructores} /></Panel>
        </div>

        <div className="space-y-6">
          <Panel titulo="Instructores">
            {instructores.length === 0 && <p className="mb-4 text-sm text-marfil/45">Aún no hay instructores registrados. Mientras tanto, las clases muestran “Instructor por definir”.</p>}
            <ul className="space-y-3">{instructores.map((i) => <li key={i.id}><FormInstructor i={i} /></li>)}</ul>
            <details className="mt-4"><summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-oro">+ Agregar instructor</summary><div className="mt-3"><FormInstructor /></div></details>
          </Panel>

          <Panel titulo={`Alumnos inscritos (${inscripciones.length})`}>
            {inscripciones.length === 0 ? <Vacio>Sin inscripciones todavía.</Vacio> : (
              <ul className="divide-y divide-marfil/5">
                {inscripciones.map((i) => {
                  const c = clases.find((x) => x.id === i.claseId);
                  const s = sesiones.find((x) => x.id === i.sesionId);
                  return (
                    <li key={i.id} className="py-3 text-sm">
                      <p className="font-medium">{i.nombre} <span className="font-mono text-xs text-marfil/40">{i.codigo}</span></p>
                      <p className="text-xs text-marfil/55">{c?.titulo} · {s ? `${formatoFechaCorta(s.inicio)} ${formatoHora(s.inicio)}` : "—"} · {i.celular}{i.nivelDeclarado ? ` · ${i.nivelDeclarado}` : ""}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Insignia tono={i.estado === "confirmada" ? "ok" : i.estado === "cancelada" ? "error" : "alerta"}>{i.estado}</Insignia>
                        {i.estado !== "confirmada" && <FormAccion accion={estadoInscripcionClase}><input type="hidden" name="id" value={i.id} /><input type="hidden" name="estado" value="confirmada" /><BotonEnviar variante="sutil">Confirmar</BotonEnviar></FormAccion>}
                        {i.estado !== "cancelada" && <FormAccion accion={estadoInscripcionClase} confirmar="¿Cancelar la inscripción?"><input type="hidden" name="id" value={i.id} /><input type="hidden" name="estado" value="cancelada" /><BotonEnviar variante="peligro">Cancelar</BotonEnviar></FormAccion>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function FormClase({ c, instructores }: { c?: Clase; instructores: Instructor[] }) {
  return (
    <FormAccion accion={guardarClase} className="space-y-3">
      {c && <><input type="hidden" name="id" value={c.id} /><input type="hidden" name="slug" value={c.slug} /></>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><Etq>Título</Etq><input name="titulo" defaultValue={c?.titulo} required className={campoAdmin} /></div>
        <div className="sm:col-span-2"><Etq>Descripción</Etq><textarea name="descripcion" defaultValue={c?.descripcion} className={`${campoAdmin} min-h-20`} /></div>
        <div><Etq>Modalidad</Etq><select name="modalidad" defaultValue={c?.modalidad ?? "ambas"} className={campoAdmin}><option value="ambas">Ambas</option><option value="carambola">Carambola</option><option value="pool">Pool</option></select></div>
        <div><Etq>Nivel</Etq><select name="nivel" defaultValue={c?.nivel ?? "Iniciación"} className={campoAdmin}>{NIVELES.map((n) => <option key={n}>{n}</option>)}</select></div>
        <div><Etq>Duración (min)</Etq><input type="number" name="duracionMin" min={15} defaultValue={c?.duracionMin ?? 60} className={campoAdmin} /></div>
        <div><Etq>Precio (COP)</Etq><input type="number" name="precio" min={0} step={1000} defaultValue={c?.precio ?? ""} placeholder="Por confirmar" className={campoAdmin} /></div>
        <div className="sm:col-span-2"><Etq>Instructor</Etq>
          <select name="instructorId" defaultValue={c?.instructorId ?? ""} className={campoAdmin}><option value="">Por definir</option>{instructores.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}</select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="activa" defaultChecked={c?.activa ?? true} className="accent-[#c5a36a]" />Visible en la web</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="confirmada" defaultChecked={c?.confirmada} className="accent-[#c5a36a]" />Confirmada por el club</label>
        <BotonEnviar>{c ? "Guardar" : "Crear programa"}</BotonEnviar>
      </div>
    </FormAccion>
  );
}

function FormInstructor({ i }: { i?: Instructor }) {
  return (
    <FormAccion accion={guardarInstructor} className="space-y-2 rounded-xl border border-marfil/10 p-3">
      {i && <input type="hidden" name="id" value={i.id} />}
      <input name="nombre" defaultValue={i?.nombre} required placeholder="Nombre" className={campoAdmin} />
      <textarea name="bio" defaultValue={i?.bio} placeholder="Perfil breve (opcional)" className={`${campoAdmin} min-h-16`} />
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="activo" defaultChecked={i?.activo ?? true} className="accent-[#c5a36a]" />Activo</label>
        <BotonEnviar variante="sutil">{i ? "Guardar" : "Agregar"}</BotonEnviar>
      </div>
    </FormAccion>
  );
}
