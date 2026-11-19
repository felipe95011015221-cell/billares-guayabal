import { guardarAjustes } from "../../acciones";
import { BotonEnviar, FormAccion } from "@/components/admin/form-accion";
import { Etq, Panel, TituloAdmin, campoAdmin } from "@/components/admin/ui";
import { Insignia } from "@/components/ui/primitives";
import { datosPendientes, siteConfig } from "@/config/site";
import { repoOError } from "@/lib/data";
import { modoDatos } from "@/lib/env";

const hhmm = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

export default async function AdminConfiguracion() {
  const a = await repoOError().obtenerAjustes();
  const pendientes = datosPendientes();
  const modo = modoDatos();
  const integraciones = [
    { n: "Base de datos (Supabase)", ok: modo === "supabase", d: modo === "supabase" ? "Conectada" : "Modo demostración local" },
    { n: "Google Analytics 4", ok: !!process.env.NEXT_PUBLIC_GA_ID, d: process.env.NEXT_PUBLIC_GA_ID ? "ID configurado" : "Falta NEXT_PUBLIC_GA_ID" },
    { n: "Dominio público", ok: !siteConfig.url.includes("localhost"), d: siteConfig.url },
    { n: "Notificaciones por correo/WhatsApp", ok: false, d: "No implementado: requiere un proveedor (ver README)" },
  ];

  return (
    <>
      <TituloAdmin titulo="Configuración" texto="Políticas de reserva, horarios y textos. Los datos comerciales fijos (dirección, teléfono, redes) se editan en src/config/site.ts." />
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel titulo="Reservas y horario" className="xl:col-span-2">
          <FormAccion accion={guardarAjustes} className="grid gap-4 sm:grid-cols-2">
            <div><Etq>Modo de confirmación</Etq>
              <select name="modoReserva" defaultValue={a.modoReserva} className={campoAdmin}>
                <option value="manual">Manual · el club confirma cada solicitud</option>
                <option value="automatica">Automática · se confirma al reservar</option>
              </select>
            </div>
            <div><Etq>Duraciones permitidas (minutos, separadas por coma)</Etq><input name="duraciones" defaultValue={a.duracionesMin.join(", ")} className={campoAdmin} /></div>
            <div><Etq>Apertura</Etq><input type="time" name="apertura" defaultValue={hhmm(a.horaApertura)} className={campoAdmin} /></div>
            <div><Etq>Cierre (si es antes de apertura = día siguiente)</Etq><input type="time" name="cierre" defaultValue={hhmm(a.horaCierre)} className={campoAdmin} /></div>
            <div><Etq>Intervalo entre horas de inicio (min)</Etq><input type="number" name="intervaloMin" min={15} step={15} defaultValue={a.intervaloMin} className={campoAdmin} /></div>
            <div><Etq>Anticipación mínima (min)</Etq><input type="number" name="anticipacionMinimaMin" min={0} defaultValue={a.anticipacionMinimaMin} className={campoAdmin} /></div>
            <div><Etq>Días máximos de anticipación</Etq><input type="number" name="diasMaximosAnticipacion" min={1} defaultValue={a.diasMaximosAnticipacion} className={campoAdmin} /></div>
            <div className="sm:col-span-2"><Etq>Política de reservas (se muestra al reservar)</Etq><textarea name="politicaReservas" defaultValue={a.politicaReservas} className={`${campoAdmin} min-h-28`} /></div>
            <div><Etq>Título del inicio (opcional)</Etq><input name="textoHero" defaultValue={a.textoHero} placeholder="El billar se vive en Guayabal" className={campoAdmin} /></div>
            <div><Etq>Subtítulo del inicio (opcional)</Etq><input name="subtituloHero" defaultValue={a.subtituloHero} className={campoAdmin} /></div>
            <div className="sm:col-span-2"><BotonEnviar>Guardar configuración</BotonEnviar></div>
          </FormAccion>
          <p className="mt-4 text-xs text-marfil/45">Las tarifas se definen por mesa en “Mesas”.</p>
        </Panel>

        <div className="space-y-6">
          <Panel titulo="Integraciones">
            <ul className="space-y-3 text-sm">
              {integraciones.map((i) => (
                <li key={i.n} className="flex items-start justify-between gap-3">
                  <span>{i.n}<span className="block text-xs text-marfil/45">{i.d}</span></span>
                  <Insignia tono={i.ok ? "ok" : "alerta"}>{i.ok ? "Activa" : "Pendiente"}</Insignia>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel titulo="Datos del negocio por confirmar">
            <ul className="space-y-3 text-sm">
              {pendientes.map((p) => (
                <li key={p.campo}>
                  <p className="flex items-center justify-between gap-2">{p.campo}<Insignia tono="alerta">{p.estado === "publico" ? "Por validar" : "Falta"}</Insignia></p>
                  <p className="text-xs text-marfil/45">{Array.isArray(p.valor) ? p.valor.join(", ") : String(p.valor || "—")}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
