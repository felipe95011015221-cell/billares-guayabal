import { ConsultaReserva } from "@/components/forms/consulta-reserva";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { Contenedor, Seccion } from "@/components/ui/primitives";
import { metadatos } from "@/lib/seo";

export const metadata = { ...metadatos({ titulo: "Consultar mi reserva", descripcion: "Consulta el estado de tu reserva en Club de Billares Guayabal con tu código y celular.", ruta: "/reservas/consultar" }), robots: { index: false } };

export default function ConsultarPage() {
  return (
    <>
      <EncabezadoPagina eyebrow="Mi reserva" titulo={<>Consulta tu <em className="text-oro">reserva.</em></>} texto="Por tu privacidad, pedimos el código y el celular con el que hiciste la solicitud." />
      <Seccion tono="oscuro" className="!pt-4">
        <Contenedor><ConsultaReserva /></Contenedor>
      </Seccion>
    </>
  );
}
