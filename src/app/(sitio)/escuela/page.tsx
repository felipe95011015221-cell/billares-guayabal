import { CalendarDays, Clock, GraduationCap, Tag, User, Users } from "lucide-react";
import { fotos } from "@/config/images";
import { InscripcionClase } from "@/components/forms/inscripcion-clase";
import { CtaFinal } from "@/components/site/cta-final";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { Aviso, Contenedor, Insignia, Seccion } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { formatoCOP } from "@/lib/format";
import { clasesPublicas } from "@/lib/public-data";
import { metadatos } from "@/lib/seo";
import { etiquetaDuracion, formatoFechaCorta, formatoHora } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata = metadatos({
  titulo: "Clases de billar en Medellín · Escuela",
  descripcion: "Escuela de billar en Guayabal, Medellín: iniciación, carambola a tres bandas, pool para principiantes, técnica y clases particulares.",
  ruta: "/escuela",
  imagen: fotos.manoTaco.src,
});

const modalidad = { carambola: "Carambola", pool: "Pool", ambas: "Carambola y pool" } as const;

export default async function EscuelaPage() {
  const clases = await clasesPublicas();
  const hayPropuestas = clases.some((c) => !c.confirmada);
  const calendario = clases
    .flatMap((c) => c.sesiones.map((s) => ({ ...s, titulo: c.titulo, slug: c.slug })))
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
    .slice(0, 10);

  return (
    <>
      <EncabezadoPagina
        eyebrow="Escuela de billar"
        titulo={<>La precisión <em className="text-oro">se entrena.</em></>}
        texto="Programas por niveles para aprender desde cero o llevar tu juego al siguiente nivel, en carambola a tres bandas y pool."
        foto={fotos.manoTaco}
      />

      <Seccion tono="claro" className="!pt-16">
        <Contenedor>
          {hayPropuestas && (
            <Aviso className="mb-14 max-w-3xl text-carbon/80">
              Estos programas son una <strong>propuesta inicial</strong> y están pendientes de confirmación por el club. Instructores, precios y horarios
              definitivos se publicarán al aprobarse. Puedes pre-inscribirte para que te contactemos.
            </Aviso>
          )}

          {calendario.length > 0 && (
            <Reveal className="mb-20">
              <h2 className="flex items-center gap-3 font-display text-4xl"><CalendarDays className="h-7 w-7 text-verde" />Calendario de clases</h2>
              <ul className="mt-8 divide-y divide-carbon/10 border-y border-carbon/10">
                {calendario.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.slug}`} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-carbon/[0.03] sm:grid-cols-[9rem_1fr_auto]">
                      <span className="text-sm font-semibold">{formatoFechaCorta(s.inicio)}</span>
                      <span><span className="block font-display text-xl leading-tight">{s.titulo}</span><span className="text-xs text-carbon/55">{formatoHora(s.inicio)}</span></span>
                      <span className="text-xs uppercase tracking-[0.12em] text-carbon/60">{s.disponibles > 0 ? `${s.disponibles} cupos` : "Lleno"}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <div className="space-y-8">
            {clases.map((c, i) => (
              <Reveal key={c.id} as="article">
                <div id={c.slug} className="scroll-mt-28 grid gap-10 rounded-3xl border border-carbon/10 bg-[#fbf8f1] p-7 sm:p-10 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <div className="flex flex-wrap gap-2">
                      <Insignia tono="verde">{c.nivel}</Insignia>
                      <Insignia tono="verde">{modalidad[c.modalidad]}</Insignia>
                      {!c.confirmada && <Insignia tono="alerta" className="!text-oro-oscuro">Propuesta · por confirmar</Insignia>}
                    </div>
                    <p className="mt-8 font-display text-6xl leading-none text-oro-oscuro/40">{String(i + 1).padStart(2, "0")}</p>
                    <h2 className="mt-3 font-display text-4xl sm:text-5xl">{c.titulo}</h2>
                    <p className="mt-4 leading-relaxed text-carbon/70">{c.descripcion}</p>
                    <dl className="mt-8 grid grid-cols-2 gap-5 text-sm">
                      <Dato icono={<Clock className="h-4 w-4" />} t="Duración" v={etiquetaDuracion(c.duracionMin)} />
                      <Dato icono={<GraduationCap className="h-4 w-4" />} t="Nivel" v={c.nivel} />
                      <Dato icono={<User className="h-4 w-4" />} t="Instructor" v={c.instructor?.nombre ?? "Por definir"} />
                      <Dato icono={<Tag className="h-4 w-4" />} t="Precio" v={formatoCOP(c.precio)} />
                      <Dato icono={<Users className="h-4 w-4" />} t="Cupos" v={c.sesiones.length ? `${c.sesiones.reduce((a, s) => a + Math.max(0, s.disponibles), 0)} disponibles` : "Por definir"} />
                    </dl>
                  </div>
                  <div className="lg:col-span-6 lg:col-start-7">
                    <h3 className="mb-5 font-display text-2xl">Próximos horarios</h3>
                    <InscripcionClase sesiones={c.sesiones} titulo={c.slug} confirmada={c.confirmada} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Contenedor>
      </Seccion>
      <CtaFinal titulo="La pasión se vive en la mesa." />
    </>
  );
}

function Dato({ icono, t, v }: { icono: React.ReactNode; t: string; v: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-carbon/50"><span className="text-verde">{icono}</span>{t}</dt>
      <dd className="mt-1">{v}</dd>
    </div>
  );
}
