import Image from "next/image";
import Link from "next/link";
import { fotos } from "@/config/images";
import { estiloBoton } from "@/components/ui/button";
import { Contenedor } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export function CtaFinal({ titulo = "Tu próxima partida comienza aquí." }: { titulo?: string }) {
  return (
    <section className="relative isolate overflow-hidden py-32 sm:py-44">
      <Image src={fotos.salonMesas.src} alt="" fill sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-carbon/75" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(17_23_20/0.9)_75%)]" />
      <Contenedor className="text-center">
        <Reveal>
          <p className="eyebrow mb-8 justify-center">Reserva en minutos</p>
          <h2 className="mx-auto max-w-4xl font-display text-5xl leading-[0.95] sm:text-7xl lg:text-8xl">{titulo}</h2>
          <div className="mt-12 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Link href="/reservas" className={estiloBoton("oro", "lg")}>Reservar una mesa</Link>
            <a href={enlaceWhatsApp("reservas")} target="_blank" rel="noopener noreferrer" className={estiloBoton("contorno", "lg")}>Escribir por WhatsApp</a>
          </div>
        </Reveal>
      </Contenedor>
      <span className="pointer-events-none absolute bottom-3 right-4 text-[0.58rem] uppercase tracking-[0.16em] text-marfil/40">Foto de referencia</span>
    </section>
  );
}
