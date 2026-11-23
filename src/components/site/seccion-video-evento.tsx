import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { videoEventoNoviembre } from "@/config/videos";
import { estiloBoton } from "@/components/ui/button";
import { Contenedor, Seccion } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { VideoEvento } from "./video-evento";

/** Bloque destacado con el video del último evento del club. */
export function SeccionVideoEvento({ conBoton = true }: { conBoton?: boolean }) {
  const v = videoEventoNoviembre;
  return (
    <Seccion tono="verde">
      <Contenedor>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow mb-6">Nuestros eventos</p>
            <h2 className="font-display text-4xl leading-[1.02] sm:text-5xl lg:text-6xl">
              Buena energía <span className="italic text-oro">en cada mesa.</span>
            </h2>
            <p className="mt-6 inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-oro">
              <CalendarDays className="h-4 w-4" /> {v.fecha}
            </p>
            <h3 className="mt-6 font-display text-2xl text-marfil">{v.titulo}</h3>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-marfil/75 sm:text-lg">{v.descripcion}</p>
            {conBoton && (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/eventos" className={estiloBoton("oro", "md")}>Organiza tu evento</Link>
                <Link href="/reservas" className={estiloBoton("contorno", "md")}>Reservar una mesa</Link>
              </div>
            )}
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:col-start-8">
            <VideoEvento video={v} />
          </Reveal>
        </div>
      </Contenedor>
    </Seccion>
  );
}
