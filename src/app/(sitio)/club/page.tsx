import Link from "next/link";
import { fotos } from "@/config/images";
import { CtaFinal } from "@/components/site/cta-final";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { estiloBoton } from "@/components/ui/button";
import { Foto } from "@/components/ui/foto";
import { Contenedor, EncabezadoSeccion, Seccion } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { metadatos } from "@/lib/seo";

export const metadata = metadatos({
  titulo: "Nuestro club de billar en Guayabal",
  descripcion: "Billares Guayabal: un club de billar en Medellín para jugar carambola a tres bandas y pool, competir, aprender y compartir.",
  ruta: "/club",
  imagen: fotos.jugadorPool.src,
});

const pilares = [
  { n: "Jugar", t: "Una mesa bien iluminada, buen paño y tiempo para la partida. Ven solo a practicar o con tus amigos de siempre." },
  { n: "Competir", t: "El billar es medirse: contra el rival, contra la mesa y contra uno mismo. Los torneos del club serán el escenario." },
  { n: "Aprender", t: "Del primer puente a los sistemas de diamantes. La técnica se construye con método y repetición." },
  { n: "Compartir", t: "La conversación entre tiros, el aplauso a una buena carambola y la revancha pendiente para la próxima." },
];

export default function ClubPage() {
  return (
    <>
      <EncabezadoPagina
        eyebrow="Nuestro club"
        titulo={<>Un lugar para <em className="text-oro">jugar, competir, aprender</em> y compartir.</>}
        foto={fotos.salonMesas}
      />

      <Seccion tono="claro">
        <Contenedor>
          <div className="grid gap-16 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <EncabezadoSeccion
                eyebrow="La experiencia de juego"
                titulo={<>La mesa no miente. <em className="text-verde">Cada tiro cuenta.</em></>}
              />
            </Reveal>
            <Reveal delay={0.1} className="space-y-6 text-lg leading-relaxed text-carbon/75 lg:col-span-6 lg:col-start-7">
              <p>
                En el billar no hay atajos: la bola va donde la mandas. Por eso quienes lo juegan aprenden a leer la mesa, a calcular ángulos y a
                manejar la fuerza con paciencia. Es un deporte de precisión que se disfruta igual en una tarde tranquila que en una noche de
                competencia.
              </p>
              <p>
                En Billares Guayabal encontrarás mesas para las dos modalidades más jugadas en Medellín: la carambola a tres bandas, tradición del
                billar colombiano, y el pool, el juego ágil y social que reúne a los grupos.
              </p>
            </Reveal>
          </div>

          <div className="mt-20 grid gap-4 sm:grid-cols-12">
            <Reveal className="sm:col-span-7"><Foto foto={fotos.jugadorSalon} className="aspect-[4/3] rounded-sm" sizes="(min-width:640px) 58vw, 100vw" /></Reveal>
            <Reveal delay={0.1} className="sm:col-span-5"><Foto foto={fotos.tresBolas} className="aspect-[4/3] rounded-sm sm:aspect-auto sm:h-full" sizes="(min-width:640px) 42vw, 100vw" /></Reveal>
          </div>
        </Contenedor>
      </Seccion>

      <Seccion tono="oscuro">
        <Contenedor>
          <Reveal><EncabezadoSeccion eyebrow="Ambiente social" titulo={<>Cuatro razones para <span className="italic text-oro">volver a la mesa.</span></>} /></Reveal>
          <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-marfil/10 bg-marfil/10 sm:grid-cols-2 lg:grid-cols-4">
            {pilares.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.08} as="li" className="bg-carbon p-8 sm:p-10">
                <span className="font-display text-6xl text-oro/40">0{i + 1}</span>
                <h3 className="mt-8 font-display text-3xl">{p.n}</h3>
                <p className="mt-4 text-sm leading-relaxed text-marfil/65">{p.t}</p>
              </Reveal>
            ))}
          </ol>
        </Contenedor>
      </Seccion>

      <Seccion tono="verde">
        <Contenedor>
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal><Foto foto={fotos.trianguloBolas} className="aspect-[4/3] rounded-sm" sizes="(min-width:1024px) 50vw, 100vw" /></Reveal>
            <Reveal delay={0.1}>
              <EncabezadoSeccion
                eyebrow="Cultura del billar"
                titulo={<>Tradición antioqueña, <span className="italic text-oro">juego de siempre.</span></>}
                texto={
                  <>
                    <p>
                      En Colombia el billar es parte de la vida de barrio y, a la vez, un deporte de alto nivel con una fuerte tradición en la carambola a
                      tres bandas. En Medellín, los salones son lugares de encuentro entre generaciones.
                    </p>
                    <p className="mt-4">Respeto por el rival, silencio en el tiro y una buena tertulia después de la partida: así se vive la mesa.</p>
                  </>
                }
              />
            </Reveal>
          </div>
        </Contenedor>
      </Seccion>

      <Seccion tono="claro">
        <Contenedor>
          <Reveal><EncabezadoSeccion eyebrow="Modalidades disponibles" titulo="Dos maneras de vivir el billar" /></Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {[
              { t: "Carambola a tres bandas", d: "Se juega con tres bolas en una mesa sin buchacas. Para anotar, tu bola debe tocar las otras dos y al menos tres bandas antes del segundo contacto.", m: "carambola", f: fotos.mesaAzulTacos },
              { t: "Pool", d: "Mesa con seis buchacas y juegos como bola 8 o bola 9. Ritmo rápido, estrategia de posición y mucha diversión en grupo.", m: "pool", f: fotos.bolasBokeh },
            ].map((x, i) => (
              <Reveal key={x.m} delay={i * 0.1} as="article" className="overflow-hidden rounded-2xl border border-carbon/10 bg-[#fbf8f1]">
                <Foto foto={x.f} className="aspect-[16/9]" sizes="(min-width:768px) 50vw, 100vw" />
                <div className="p-8">
                  <h3 className="font-display text-3xl">{x.t}</h3>
                  <p className="mt-3 text-carbon/70">{x.d}</p>
                  <Link href={`/reservas?modalidad=${x.m}`} className={estiloBoton("verde", "sm", "mt-6")}>Reservar</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </Contenedor>
      </Seccion>

      <CtaFinal titulo="Cada partida tiene su historia." />
    </>
  );
}
