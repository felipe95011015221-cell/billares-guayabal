import { siteConfig } from "@/config/site";
import { EncabezadoPagina } from "@/components/site/encabezado-pagina";
import { Aviso, Contenedor, Seccion } from "@/components/ui/primitives";
import { metadatos } from "@/lib/seo";

export const metadata = metadatos({ titulo: "Tratamiento de datos personales", descripcion: "Política de tratamiento de datos personales de Billares Guayabal.", ruta: "/privacidad" });

export default function PrivacidadPage() {
  return (
    <>
      <EncabezadoPagina eyebrow="Legal" titulo="Tratamiento de datos personales" />
      <Seccion tono="claro" className="!py-16">
        <Contenedor className="max-w-3xl">
          <Aviso className="mb-10 text-carbon/80">
            Borrador base. Debe ser revisado y aprobado por el responsable del tratamiento (razón social, NIT y canal de atención por confirmar) antes de publicarse en producción.
          </Aviso>
          <div className="space-y-6 leading-relaxed text-carbon/80 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-carbon">
            <p>En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, {siteConfig.nombre.valor} informa cómo recolecta y usa los datos personales que recibe a través de este sitio web.</p>
            <h2>Datos que recolectamos</h2>
            <p>Nombre, número de celular, correo electrónico y, cuando aplica, documento de identidad, nivel de juego o información del evento solicitado.</p>
            <h2>Finalidades</h2>
            <p>Gestionar reservas de mesas, inscripciones a clases y torneos, solicitudes de eventos y mensajes de contacto; comunicarnos contigo sobre esas gestiones.</p>
            <h2>Derechos del titular</h2>
            <p>Puedes conocer, actualizar, rectificar y solicitar la supresión de tus datos, así como revocar la autorización, escribiendo a los canales de contacto del club.</p>
            <h2>Seguridad</h2>
            <p>Los datos se almacenan en una base de datos con acceso restringido al personal autorizado del club y no se comparten con terceros para fines comerciales.</p>
          </div>
        </Contenedor>
      </Seccion>
    </>
  );
}
