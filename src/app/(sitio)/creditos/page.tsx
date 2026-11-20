import Image from "next/image";
import { listaFotos } from "@/config/images";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { Contenedor, Seccion } from "@/components/ui/primitives";
import { metadatos } from "@/lib/seo";

export const metadata = { ...metadatos({ titulo: "Créditos fotográficos", descripcion: "Fuentes, autores y licencias de las fotografías de referencia del sitio.", ruta: "/creditos" }), robots: { index: false } };

export default function CreditosPage() {
  return (
    <>
      <EncabezadoPagina eyebrow="Créditos" titulo="Fotografías de referencia" texto="Estas imágenes provienen de bancos gratuitos con licencia de uso comercial. No muestran las instalaciones reales de Club de Billares Guayabal." />
      <Seccion tono="oscuro" className="!pt-2">
        <Contenedor>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listaFotos.map((f) => (
              <li key={f.id} className="flex gap-4 rounded-xl border border-marfil/10 p-3">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded"><Image src={f.src} alt={f.alt} fill sizes="96px" className="object-cover" /></div>
                <div className="text-sm">
                  <p className="font-semibold">{f.autor}</p>
                  <p className="text-marfil/60"><a href={f.urlFuente} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-oro hover:underline">Ver en {f.fuente}</a></p>
                  <p className="text-marfil/60"><a href={f.urlLicencia} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-oro hover:underline">{f.licencia}</a></p>
                </div>
              </li>
            ))}
          </ul>
        </Contenedor>
      </Seccion>
    </>
  );
}
