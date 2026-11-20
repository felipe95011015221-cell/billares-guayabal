import { fotos } from "@/config/images";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { Galeria } from "@/components/site/galeria";
import { Contenedor, Seccion } from "@/components/ui/primitives";
import { galeriaPublica } from "@/lib/public-data";
import { metadatos } from "@/lib/seo";

export const revalidate = 60;

export const metadata = metadatos({
  titulo: "Galería",
  descripcion: "Galería de billar: carambola a tres bandas, pool y el ambiente de Club de Billares Guayabal en Medellín.",
  ruta: "/galeria",
  imagen: fotos.tiroMesaVerde.src,
});

export default async function GaleriaPage() {
  const lista = await galeriaPublica();
  const soloReferencia = lista.every((f) => f.esReferencia);
  return (
    <>
      <EncabezadoPagina
        eyebrow="Galería"
        titulo={<>Nuestro club, <em className="text-oro">en detalle.</em></>}
        texto={soloReferencia ? "Por ahora mostramos fotografías de referencia de bancos de imágenes gratuitos. Muy pronto, fotos reales del club." : "Fotos reales de nuestras mesas de carambola y del ambiente del Club de Billares Guayabal."}
      />
      <Seccion tono="oscuro" className="!pt-4">
        <Contenedor><Galeria fotos={lista} /></Contenedor>
      </Seccion>
    </>
  );
}
