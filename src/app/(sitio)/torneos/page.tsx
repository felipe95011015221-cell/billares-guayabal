import { fotos } from "@/config/images";
import { CtaFinal } from "@/components/site/cta-final";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { TarjetaTorneo } from "@/components/site/tarjetas";
import { estiloBoton } from "@/components/ui/button";
import { Contenedor, EncabezadoSeccion, EstadoVacio, Seccion } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { torneosPublicos } from "@/lib/public-data";
import { metadatos } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata = metadatos({
  titulo: "Torneos y campeonatos de billar en Medellín",
  descripcion: "Torneos de carambola a tres bandas y pool en Billares Guayabal, Medellín. Fechas, formato, cupos e inscripción en línea.",
  ruta: "/torneos",
  imagen: fotos.trianguloTacos.src,
});

export default async function TorneosPage() {
  const torneos = await torneosPublicos();
  const activos = torneos.filter((t) => ["inscripciones_abiertas", "inscripciones_cerradas", "en_juego"].includes(t.estado));
  const pasados = torneos.filter((t) => t.estado === "finalizado");

  return (
    <>
      <EncabezadoPagina eyebrow="Torneos y campeonatos" titulo={<>Mide tu juego <em className="text-oro">en la mesa.</em></>} texto="Competencias de carambola a tres bandas y pool organizadas por el club. Consulta formato, requisitos y cupos." foto={fotos.trianguloTacos} />
      <Seccion tono="oscuro" className="!pt-10">
        <Contenedor>
          <Reveal><EncabezadoSeccion eyebrow="Próximos eventos" titulo="Calendario competitivo" /></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activos.length ? activos.map((t, i) => <Reveal key={t.id} delay={i * 0.08}><TarjetaTorneo torneo={t} /></Reveal>) : (
              <div className="md:col-span-2 lg:col-span-3">
                <EstadoVacio
                  titulo="Aún no hay torneos publicados"
                  texto="El club anunciará aquí sus próximos campeonatos con fecha, formato, valor de inscripción y cupos. Déjanos tu número por WhatsApp para avisarte."
                  accion={<a href={enlaceWhatsApp("torneos")} target="_blank" rel="noopener noreferrer" className={estiloBoton("oro", "md")}>Quiero que me avisen</a>}
                />
              </div>
            )}
          </div>
          {pasados.length > 0 && (
            <div className="mt-24">
              <h2 className="font-display text-4xl">Resultados anteriores</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{pasados.map((t) => <TarjetaTorneo key={t.id} torneo={t} />)}</div>
            </div>
          )}
        </Contenedor>
      </Seccion>
      <CtaFinal titulo="Domina la mesa. Vive el juego." />
    </>
  );
}
