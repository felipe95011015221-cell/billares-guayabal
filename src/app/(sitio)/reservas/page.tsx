import Link from "next/link";
import { fotos } from "@/config/images";
import { ReservaWizard } from "@/components/forms/reserva-wizard";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { IconoWhatsApp } from "@/components/icons";
import { estiloBoton } from "@/components/ui/button";
import { Aviso, Contenedor, Seccion } from "@/components/ui/primitives";
import { repo } from "@/lib/data";
import { metadatos } from "@/lib/seo";
import { hoyBogota, sumarDias } from "@/lib/time";
import type { Modalidad } from "@/lib/types";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata = metadatos({
  titulo: "Reservar mesa de billar en Medellín",
  descripcion: "Reserva tu mesa de carambola a tres bandas o pool en Club de Billares Guayabal, Medellín. Consulta disponibilidad en tiempo real y recibe tu código.",
  ruta: "/reservas",
  imagen: fotos.tiroMesaVerde.src,
});

export default async function ReservasPage({ searchParams }: { searchParams: Promise<{ modalidad?: string }> }) {
  const { modalidad } = await searchParams;
  const r = repo();
  const ajustes = r ? await r.obtenerAjustes() : null;
  const hoy = hoyBogota();

  return (
    <>
      <EncabezadoPagina
        eyebrow="Reservas"
        titulo={<>Reserva tu <em className="text-oro">mesa.</em></>}
        texto="Elige modalidad, fecha y hora. Verificamos la disponibilidad real de cada mesa antes de registrar tu solicitud."
        foto={fotos.tiroMesaVerde}
      >
        <Link href="/reservas/consultar" className="mt-8 inline-block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-oro hover:text-oro-claro">
          ¿Ya reservaste? Consulta tu reserva →
        </Link>
      </EncabezadoPagina>
      <Seccion tono="oscuro" className="!pt-6">
        <Contenedor>
          {ajustes ? (
            <>
              <Aviso className="mb-10 max-w-3xl">
                El inventario de mesas y las tarifas mostradas son configurables y están <strong>pendientes de confirmación</strong> por el club.
                {ajustes.modoReserva === "manual" && " Las reservas en línea son solicitudes: quedan aprobadas solo cuando el club las confirma."}
              </Aviso>
              <ReservaWizard
                modalidadInicial={modalidad === "pool" || modalidad === "carambola" ? (modalidad as Modalidad) : undefined}
                duraciones={ajustes.duracionesMin}
                hoy={hoy}
                maximo={sumarDias(hoy, ajustes.diasMaximosAnticipacion)}
                modoReserva={ajustes.modoReserva}
                politica={ajustes.politicaReservas}
              />
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-marfil/10 bg-carbon-2 p-10 text-center">
              <h2 className="font-display text-4xl">Reservas en línea en preparación</h2>
              <p className="mt-4 text-marfil/65">Mientras activamos el sistema, escríbenos por WhatsApp y te ayudamos a separar tu mesa.</p>
              <a href={enlaceWhatsApp("reservas")} target="_blank" rel="noopener noreferrer" className={estiloBoton("oro", "lg", "mt-8")}>
                <IconoWhatsApp className="h-5 w-5" />Reservar por WhatsApp
              </a>
            </div>
          )}
        </Contenedor>
      </Seccion>
    </>
  );
}
