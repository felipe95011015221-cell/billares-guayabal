import Link from "next/link";
import { ArrowRight, CalendarCheck, Search, Sparkles, Ticket } from "lucide-react";
import Image from "next/image";
import { fotos, listaFotosClub } from "@/config/images";
import { Hero } from "@/components/home/hero";
import { CtaFinal } from "@/components/site/cta-final";
import { TarjetaClase, TarjetaTorneo } from "@/components/site/tarjetas";
import { Ubicacion } from "@/components/site/ubicacion";
import { estiloBoton } from "@/components/ui/button";
import { Foto } from "@/components/ui/foto";
import { Contenedor, EncabezadoSeccion, EstadoVacio, Seccion } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { ajustesPublicos, clasesPublicas, torneosPublicos } from "@/lib/public-data";
import { metadatos } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export const revalidate = 60;

export const metadata = metadatos({
  titulo: "Club de Billares Guayabal · Billar en Medellín",
  descripcion:
    "Billares en Medellín: carambola a tres bandas y pool en Guayabal. Reserva tu mesa de billar en línea, clases, torneos y eventos.",
  ruta: "/",
});

const pasos = [
  { icono: Sparkles, titulo: "Elige tu juego", texto: "Carambola o pool, fecha, hora y duración." },
  { icono: Search, titulo: "Mira la disponibilidad", texto: "Consultamos el estado real de cada mesa en el servidor." },
  { icono: CalendarCheck, titulo: "Recibe tu código", texto: "Tu solicitud queda registrada con un código único." },
];

export default async function Inicio() {
  const [ajustes, clases, torneos] = await Promise.all([ajustesPublicos(), clasesPublicas(), torneosPublicos()]);
  const proximos = torneos.filter((t) => ["inscripciones_abiertas", "inscripciones_cerradas", "en_juego"].includes(t.estado)).slice(0, 2);

  return (
    <>
      <Hero
        titulo={ajustes.textoHero || "El billar se vive en Guayabal"}
        subtitulo={ajustes.subtituloHero || "Precisión, estrategia y pasión por cada partida. Descubre una nueva forma de vivir el billar en Medellín."}
      />

      {/* PRESENTACIÓN DEL CLUB */}
      <Seccion tono="claro" id="club">
        <Contenedor>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <Reveal>
                <EncabezadoSeccion
                  eyebrow="El club"
                  titulo={<>Cada partida tiene <em className="text-verde">su historia.</em></>}
                  texto={
                    <>
                      <p>
                        Club de Billares Guayabal es un punto de encuentro en Medellín para quienes disfrutan el billar: el que viene a jugar con amigos un
                        viernes, el que entrena su tiro de tres bandas y el que busca rivales para medirse.
                      </p>
                      <p className="mt-4">Aquí se juega, se compite, se aprende y se comparte. Cada mesa, una conversación distinta.</p>
                    </>
                  }
                />
                <Link href="/club" className={estiloBoton("oscuro", "md", "mt-10")}>Conoce el club <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
              </Reveal>
            </div>
            <div className="relative lg:col-span-7">
              <Reveal y={40}>
                <Foto foto={fotos.jugadorPool} className="aspect-[4/3] rounded-sm" sizes="(min-width:1024px) 58vw, 100vw" />
              </Reveal>
              <Reveal delay={0.2} className="absolute -bottom-10 -left-4 w-[42%] sm:-left-10 lg:-left-16">
                <Foto foto={fotos.manoTaco} className="aspect-[3/4] rounded-sm border-8 border-marfil shadow-2xl" sizes="30vw" etiqueta={false} />
              </Reveal>
            </div>
          </div>
        </Contenedor>
      </Seccion>

      {/* MODALIDADES */}
      <Seccion tono="oscuro">
        <Contenedor>
          <Reveal>
            <EncabezadoSeccion eyebrow="Modalidades" titulo={<>Domina la mesa. <span className="italic text-oro">Vive el juego.</span></>} />
          </Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              { foto: fotos.jugadorSalon, nombre: "Carambola a tres bandas", texto: "Tres bolas, una mesa sin buchacas y la exigencia de tocar al menos tres bandas antes de la carambola. Geometría, paciencia y control.", m: "carambola" },
              { foto: fotos.bolasBokeh, nombre: "Pool", texto: "Ritmo ágil, buchacas y estrategia para dejar la siguiente bola servida. Ideal para jugar en grupo y para competir.", m: "pool" },
            ].map((x, i) => (
              <Reveal key={x.m} delay={i * 0.12} as="article">
                <Link href={`/reservas?modalidad=${x.m}`} className="group relative block aspect-[4/5] overflow-hidden rounded-sm sm:aspect-[5/4]">
                  <Foto foto={x.foto} className="absolute inset-0" imgClassName="transition-transform duration-[1.6s] ease-[var(--ease-club)] group-hover:scale-105" sizes="(min-width:768px) 50vw, 100vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-oro">0{i + 1}</p>
                    <h3 className="mt-3 font-display text-4xl sm:text-5xl">{x.nombre}</h3>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-marfil/70">{x.texto}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-oro">
                      Reservar {x.m === "pool" ? "mesa de pool" : "mesa de carambola"} <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Contenedor>
      </Seccion>

      {/* RESERVAS */}
      <Seccion tono="verde">
        <Contenedor>
          <div className="grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <EncabezadoSeccion
                eyebrow="Reservas en línea"
                titulo={<>Tu mesa, <span className="italic text-oro">lista</span> cuando llegues.</>}
                texto="Consulta la disponibilidad real, escoge la mesa y envía tu solicitud en menos de dos minutos desde el celular."
              />
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/reservas" className={estiloBoton("oro", "lg")}>Reservar una mesa</Link>
                <Link href="/reservas/consultar" className={estiloBoton("contorno", "lg")}>Consultar mi reserva</Link>
              </div>
            </Reveal>
            <ol className="grid gap-4 lg:col-span-6 lg:col-start-7">
              {pasos.map((p, i) => (
                <Reveal key={p.titulo} delay={i * 0.1} as="li">
                  <div className="flex gap-6 rounded-2xl border border-marfil/15 bg-carbon/20 p-6 backdrop-blur-sm sm:p-8">
                    <span className="font-display text-5xl leading-none text-oro/70">{i + 1}</span>
                    <div>
                      <h3 className="flex items-center gap-2 font-display text-2xl"><p.icono className="h-5 w-5 text-oro" />{p.titulo}</h3>
                      <p className="mt-2 text-sm text-marfil/70">{p.texto}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </Contenedor>
      </Seccion>

      {/* CLASES */}
      <Seccion tono="claro">
        <Contenedor>
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <Reveal>
              <EncabezadoSeccion
                eyebrow="Escuela de billar"
                titulo={<>La precisión se entrena. <em className="text-verde">La pasión se vive.</em></>}
                texto="Programas por niveles para empezar desde cero o pulir tu técnica en carambola y pool."
              />
            </Reveal>
            <Link href="/escuela" className={estiloBoton("oscuro", "md", "shrink-0 self-start lg:self-auto")}>Ver programas</Link>
          </div>
          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {clases.slice(0, 3).map((c, i) => (
              <Reveal key={c.id} delay={i * 0.08} className="h-full"><TarjetaClase clase={c} indice={i} /></Reveal>
            ))}
          </div>
        </Contenedor>
      </Seccion>

      {/* TORNEOS Y EVENTOS */}
      <Seccion tono="oscuro">
        <Contenedor>
          <Reveal>
            <EncabezadoSeccion eyebrow="Torneos y eventos" titulo={<>Compite. Celebra. <span className="italic text-oro">Comparte la mesa.</span></>} />
          </Reveal>
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            <div className="grid gap-6 lg:col-span-2 md:grid-cols-2">
              {proximos.length ? (
                proximos.map((t, i) => <Reveal key={t.id} delay={i * 0.1}><TarjetaTorneo torneo={t} /></Reveal>)
              ) : (
                <div className="md:col-span-2">
                  <EstadoVacio
                    titulo="Próximos torneos por anunciar"
                    texto="Cuando el club publique un campeonato, aquí verás fechas, formato, cupos e inscripción en línea."
                    accion={<a href={enlaceWhatsApp("torneos")} target="_blank" rel="noopener noreferrer" className={estiloBoton("contorno", "sm")}>Avísenme por WhatsApp</a>}
                  />
                </div>
              )}
            </div>
            <Reveal delay={0.15}>
              <Link href="/eventos" className="group relative flex h-full min-h-[340px] flex-col justify-end overflow-hidden rounded-2xl p-8">
                <Foto foto={fotos.trianguloTacos} className="absolute inset-0" imgClassName="transition-transform duration-[1.6s] group-hover:scale-105" sizes="(min-width:1024px) 33vw, 100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/60 to-carbon/10" />
                <div className="relative">
                  <Ticket className="h-6 w-6 text-oro" />
                  <h3 className="mt-4 font-display text-3xl">Eventos privados y empresariales</h3>
                  <p className="mt-2 text-sm text-marfil/70">Celebraciones, integraciones y jornadas recreativas, sujetas a disponibilidad.</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-oro">Solicitar cotización <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </Reveal>
          </div>
          <div className="mt-10"><Link href="/torneos" className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-oro hover:text-oro-claro">Ver todos los torneos →</Link></div>
        </Contenedor>
      </Seccion>

      {/* GALERÍA */}
      <Seccion tono="carbon2" className="!py-20 sm:!py-28">
        <Contenedor>
          <div className="flex items-end justify-between gap-6">
            <Reveal><EncabezadoSeccion eyebrow="Galería" titulo={<>Así se vive <span className="italic text-oro">el club.</span></>} /></Reveal>
            <Link href="/galeria" className={estiloBoton("contorno", "sm", "hidden sm:inline-flex")}>Ver galería</Link>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {listaFotosClub.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.1}>
                <Link href="/galeria" className="group relative block aspect-[4/5] overflow-hidden rounded-sm">
                  <Image src={f.src} alt={f.alt} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-club)] group-hover:scale-[1.04]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-carbon/50 via-transparent to-transparent" />
                </Link>
              </Reveal>
            ))}
          </div>
          <Link href="/galeria" className={estiloBoton("contorno", "md", "mt-8 w-full sm:hidden")}>Ver galería</Link>
        </Contenedor>
      </Seccion>

      {/* UBICACIÓN */}
      <Seccion tono="claro">
        <Contenedor>
          <Reveal><EncabezadoSeccion eyebrow="Ubicación" titulo={<>En el corazón de <em className="text-verde">Guayabal.</em></>} className="mb-14" /></Reveal>
          <Reveal><Ubicacion /></Reveal>
        </Contenedor>
      </Seccion>

      <CtaFinal />
    </>
  );
}
