import { Briefcase, PartyPopper, Smile, Users, Lock } from "lucide-react";
import { fotos } from "@/config/images";
import { SolicitudEvento } from "@/components/forms/solicitud-evento";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { Aviso, Contenedor, EncabezadoSeccion, Seccion } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/reveal";
import { metadatos } from "@/lib/seo";
import { SeccionVideoEvento } from "@/components/site/seccion-video-evento";
import { hoyBogota, sumarDias } from "@/lib/time";

export const dynamic = "force-dynamic";

export const metadata = metadatos({
  titulo: "Eventos privados y empresariales con billar en Medellín",
  descripcion: "Solicita eventos privados, encuentros empresariales, celebraciones y jornadas recreativas en Club de Billares Guayabal, Medellín.",
  ruta: "/eventos",
  imagen: fotos.salonMesas.src,
});

const tipos = [
  { i: Lock, t: "Eventos privados", d: "Mesas para tu grupo en un horario reservado." },
  { i: Briefcase, t: "Encuentros empresariales", d: "Integraciones de equipo con un plan distinto a la oficina." },
  { i: PartyPopper, t: "Celebraciones", d: "Cumpleaños, despedidas y reencuentros alrededor de la mesa." },
  { i: Smile, t: "Jornadas recreativas", d: "Una tarde de juego con clase introductoria para principiantes." },
  { i: Users, t: "Actividades grupales", d: "Mini torneos internos y retos entre amigos o colegas." },
];

export default function EventosPage() {
  return (
    <>
      <EncabezadoPagina eyebrow="Eventos y experiencias" titulo={<>Reúne a tu gente <em className="text-oro">alrededor de la mesa.</em></>} texto="Diseñamos contigo una experiencia de billar para tu grupo. Cuéntanos qué tienes en mente." foto={fotos.salonMesas} />
      <Seccion tono="oscuro" className="!pt-8">
        <Contenedor>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {tipos.map((x, k) => (
              <Reveal key={x.t} delay={k * 0.06} as="li" className="rounded-2xl border border-marfil/10 p-6 transition-colors hover:border-oro/40">
                <x.i className="h-6 w-6 text-oro" />
                <h2 className="mt-5 font-display text-2xl leading-tight">{x.t}</h2>
                <p className="mt-2 text-sm text-marfil/60">{x.d}</p>
              </Reveal>
            ))}
          </ul>
        </Contenedor>
      </Seccion>
      <SeccionVideoEvento conBoton={false} />
      <Seccion tono="claro">
        <Contenedor>
          <div className="grid gap-14 lg:grid-cols-12">
            <Reveal className="lg:col-span-4">
              <EncabezadoSeccion eyebrow="Solicitud" titulo={<>Cuéntanos <em className="text-verde">tu plan.</em></>} texto="Respondemos con disponibilidad y propuesta. Ninguna solicitud se considera confirmada hasta que el club la apruebe." />
              <Aviso className="mt-8 text-carbon/80">Capacidad, paquetes y valores de eventos están pendientes de definición por el club.</Aviso>
            </Reveal>
            <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6"><SolicitudEvento manana={sumarDias(hoyBogota(), 1)} /></Reveal>
          </div>
        </Contenedor>
      </Seccion>
    </>
  );
}
