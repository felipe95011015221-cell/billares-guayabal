import { CalendarCheck, GraduationCap, PartyPopper, Trophy } from "lucide-react";
import { FormularioContacto } from "@/components/forms/contacto";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { Ubicacion } from "@/components/site/ubicacion";
import { IconoWhatsApp } from "@/components/icons";
import { Contenedor, EncabezadoSeccion, Seccion } from "@/components/ui/primitives";
import { metadatos } from "@/lib/seo";
import { enlaceWhatsApp, type ContextoWhatsApp } from "@/lib/whatsapp";

export const metadata = metadatos({
  titulo: "Contacto y ubicación",
  descripcion: "Ubicación, teléfono, WhatsApp y cómo llegar a Club de Billares Guayabal en Guayabal, Medellín.",
  ruta: "/contacto",
});

const accesos: { c: ContextoWhatsApp; t: string; i: typeof Trophy }[] = [
  { c: "reservas", t: "Reservas", i: CalendarCheck },
  { c: "clases", t: "Clases", i: GraduationCap },
  { c: "torneos", t: "Torneos", i: Trophy },
  { c: "eventos", t: "Eventos", i: PartyPopper },
];

export default function ContactoPage() {
  return (
    <>
      <EncabezadoPagina eyebrow="Contacto" titulo={<>Hablemos de <em className="text-oro">billar.</em></>} texto="Escríbenos por WhatsApp según lo que necesites, o déjanos un mensaje." />
      <Seccion tono="oscuro" className="!pt-2">
        <Contenedor>
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {accesos.map((a) => (
              <li key={a.c}>
                <a href={enlaceWhatsApp(a.c)} target="_blank" rel="noopener noreferrer" className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-marfil/10 p-6 transition hover:border-oro/50">
                  <a.i className="h-6 w-6 text-oro" />
                  <span>
                    <span className="block font-display text-2xl">{a.t}</span>
                    <span className="mt-1 flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-marfil/55 group-hover:text-oro"><IconoWhatsApp className="h-3.5 w-3.5" />Escribir</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-20 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4"><EncabezadoSeccion eyebrow="Formulario" titulo="Déjanos un mensaje" /></div>
            <div className="lg:col-span-7 lg:col-start-6"><FormularioContacto /></div>
          </div>
        </Contenedor>
      </Seccion>
      <Seccion tono="claro">
        <Contenedor>
          <EncabezadoSeccion eyebrow="Ubicación" titulo="Club de Billares Guayabal" className="mb-12" />
          <Ubicacion />
        </Contenedor>
      </Seccion>
    </>
  );
}
