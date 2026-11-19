import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ClipboardList, Medal, Ticket, Users } from "lucide-react";
import { fotos } from "@/config/images";
import { InscripcionTorneo } from "@/components/forms/inscripcion-torneo";
import { CuadroEliminacion } from "@/components/site/cuadro";
import { ESTADOS_TORNEO } from "@/components/site/tarjetas";
import { IconoWhatsApp } from "@/components/icons";
import { estiloBoton } from "@/components/ui/button";
import { Aviso, Contenedor, Insignia, Seccion } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import { formatoCOP } from "@/lib/format";
import { torneosPublicos } from "@/lib/public-data";
import { metadatos } from "@/lib/seo";
import { formatoFecha, formatoHora } from "@/lib/time";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

async function obtener(slug: string) {
  return (await torneosPublicos()).find((t) => t.slug === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = await obtener((await params).slug);
  if (!t) return {};
  return { ...metadatos({ titulo: t.nombre, descripcion: `${t.formato}. ${t.descripcion}`.slice(0, 160), ruta: `/torneos/${t.slug}`, imagen: fotos.trianguloTacos.src }), ...(t.esDemo ? { robots: { index: false } } : {}) };
}

export default async function TorneoPage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await obtener((await params).slug);
  if (!t) notFound();
  const [partidos, inscritos] = await Promise.all([repo()!.listarPartidos(t.id), repo()!.listarInscripcionesTorneo(t.id)]);
  const confirmados = inscritos.filter((i) => i.estado === "confirmada");
  const est = ESTADOS_TORNEO[t.estado];
  const libres = Math.max(0, t.cupos - t.inscritos);

  return (
    <>
      <section className="relative overflow-hidden bg-carbon pb-16 pt-36 sm:pt-44">
        <Contenedor>
          <Link href="/torneos" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-marfil/55 hover:text-oro"><ArrowLeft className="h-4 w-4" />Torneos</Link>
          <div className="mt-8 flex flex-wrap gap-2">
            <Insignia tono={est.tono}>{est.texto}</Insignia>
            <Insignia tono="oro">{t.modalidad === "carambola" ? "Tres bandas" : "Pool"}</Insignia>
            {t.esDemo && <Insignia tono="alerta">Demostración · no es un evento real</Insignia>}
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] sm:text-7xl">{t.nombre}</h1>
          <p className="mt-6 max-w-2xl text-lg text-marfil/70">{t.descripcion}</p>
        </Contenedor>
      </section>

      <Seccion tono="oscuro" className="!pt-0">
        <Contenedor>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="space-y-14 lg:col-span-7">
              <dl className="grid gap-px overflow-hidden rounded-2xl border border-marfil/10 bg-marfil/10 sm:grid-cols-2">
                <Info icono={<CalendarDays />} t="Fecha" v={<span className="first-letter:uppercase">{formatoFecha(t.fecha)} · {formatoHora(t.fecha)}</span>} />
                <Info icono={<ClipboardList />} t="Formato" v={t.formato} />
                <Info icono={<Ticket />} t="Inscripción" v={formatoCOP(t.valorInscripcion)} />
                <Info icono={<Users />} t="Cupos" v={`${libres} disponibles de ${t.cupos}`} />
                <div className="bg-carbon p-6 sm:col-span-2">
                  <dt className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-marfil/50"><Medal className="h-4 w-4 text-oro" />Requisitos</dt>
                  <dd className="mt-2 text-marfil/80">{t.requisitos || "Por publicar."}</dd>
                </div>
              </dl>

              {partidos.length > 0 && (
                <div>
                  <h2 className="font-display text-4xl">Cuadro de eliminación</h2>
                  <p className="mt-2 text-sm text-marfil/55">Resultados actualizados por el club.</p>
                  <div className="mt-8"><CuadroEliminacion partidos={partidos} /></div>
                </div>
              )}

              {confirmados.length > 0 && (
                <div>
                  <h2 className="font-display text-4xl">Participantes confirmados</h2>
                  <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {confirmados.map((p) => <li key={p.id} className="rounded-lg border border-marfil/10 px-4 py-3 text-sm">{p.nombre}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <aside className="lg:col-span-5">
              <div className="sticky top-28 rounded-3xl border border-oro/25 bg-carbon-2 p-7 sm:p-9">
                <h2 className="font-display text-3xl">Inscripción</h2>
                {t.estado === "inscripciones_abiertas" && libres > 0 ? (
                  <div className="mt-6">
                    {t.esDemo && <Aviso tono="alerta" className="mb-6">Torneo de demostración: la inscripción solo sirve para probar el flujo.</Aviso>}
                    <InscripcionTorneo torneoId={t.id} />
                  </div>
                ) : (
                  <div className="mt-6 space-y-5">
                    <p className="text-marfil/70">{t.estado === "inscripciones_abiertas" ? "No quedan cupos disponibles." : "Las inscripciones no están abiertas en este momento."}</p>
                    <a href={enlaceWhatsApp("torneos", `Torneo: ${t.nombre}`)} target="_blank" rel="noopener noreferrer" className={estiloBoton("contorno", "md")}><IconoWhatsApp className="h-4 w-4" />Preguntar por WhatsApp</a>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </Contenedor>
      </Seccion>
    </>
  );
}

function Info({ icono, t, v }: { icono: React.ReactElement; t: string; v: React.ReactNode }) {
  return (
    <div className="bg-carbon p-6">
      <dt className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-marfil/50"><span className="text-oro [&_svg]:h-4 [&_svg]:w-4">{icono}</span>{t}</dt>
      <dd className="mt-2 text-lg">{v}</dd>
    </div>
  );
}
