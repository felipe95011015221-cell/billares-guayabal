/**
 * CONFIGURACIÓN CENTRAL DEL NEGOCIO — Club de Billares Guayabal
 *
 * Todos los datos comerciales viven aquí. Cada dato lleva un estado de verificación:
 *  - "confirmado": validado por el propietario. Puede publicarse y usarse en datos estructurados (SEO).
 *  - "publico":    encontrado en plataformas públicas, aún NO validado por el propietario.
 *                  Se muestra en la web con la nota "por confirmar" y NO entra en los datos estructurados.
 *  - "pendiente":  no hay dato. La web muestra "Por confirmar".
 *
 * Cuando el propietario valide un dato, cambie su `estado` a "confirmado".
 * Los valores editables en tiempo real (tarifas, horarios, políticas) también pueden
 * sobrescribirse desde el panel /admin/configuracion.
 */

export type EstadoDato = "confirmado" | "publico" | "pendiente";

export interface Dato<T> {
  valor: T;
  estado: EstadoDato;
  fuente?: string;
}

export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nombre: { valor: "Club de Billares Guayabal", estado: "confirmado", fuente: "Confirmado por el cliente junto con el logo oficial (19 nov. 2026)" } as Dato<string>,
  nombreCorto: "Club de Billares Guayabal",
  ciudad: { valor: "Medellín", estado: "confirmado" } as Dato<string>,
  barrio: { valor: "Guayabal", estado: "publico", fuente: "Brief del proyecto" } as Dato<string>,
  region: "Antioquia",
  pais: "CO",
  direccion: {
    valor: "Carrera 52 #9-17, Guayabal, Medellín",
    estado: "publico",
    fuente: "Dato público reportado en el brief. Una búsqueda web (nov. 2026) no lo pudo contrastar.",
  } as Dato<string>,
  /** Coordenadas aproximadas solo para centrar el mapa; validar con el pin real del negocio. */
  mapaConsulta: "Carrera 52 %239-17, Guayabal, Medellín, Antioquia, Colombia",
  telefono: {
    valor: "+57 314 773 0533",
    estado: "publico",
    fuente: "Dato público reportado en el brief, pendiente de validación.",
  } as Dato<string>,
  /** Número en formato internacional sin signos, usado para wa.me y tel: */
  telefonoE164: "573147730533",
  whatsappHabilitado: true,
  correo: { valor: "", estado: "pendiente" } as Dato<string>,
  horario: {
    valor: "Todos los días, 9:00 a. m. – 2:00 a. m.",
    estado: "publico",
    fuente: "Horario reportado en plataformas públicas, pendiente de validación.",
  } as Dato<string>,
  /** Horario operativo usado por el motor de reservas (minutos desde las 00:00, hora Bogotá). 26:00 = 2:00 a. m. del día siguiente. */
  horarioOperativo: { apertura: 9 * 60, cierre: 26 * 60 },
  modalidades: { valor: ["Carambola a tres bandas", "Pool"], estado: "publico" } as Dato<string[]>,
  redes: {
    instagram: { valor: "", estado: "pendiente" } as Dato<string>,
    facebook: { valor: "", estado: "pendiente" } as Dato<string>,
  },
  zonaHoraria: "America/Bogota",
  moneda: "COP",
  locale: "es-CO",
} as const;

export const esConfirmado = (d: Dato<unknown>) => d.estado === "confirmado";
export const mostrarDato = (d: Dato<string>) => (d.valor ? d.valor : "Por confirmar");

/** Lista de datos empresariales pendientes (se muestra en /admin/configuracion y README). */
export function datosPendientes() {
  const entradas: [string, Dato<unknown>][] = [
    ["Nombre comercial", siteConfig.nombre],
    ["Barrio", siteConfig.barrio],
    ["Dirección", siteConfig.direccion],
    ["Teléfono / WhatsApp", siteConfig.telefono],
    ["Correo electrónico", siteConfig.correo],
    ["Horario", siteConfig.horario],
    ["Modalidades", siteConfig.modalidades],
    ["Instagram", siteConfig.redes.instagram],
    ["Facebook", siteConfig.redes.facebook],
  ];
  return entradas.filter(([, d]) => d.estado !== "confirmado").map(([k, d]) => ({ campo: k, ...d }));
}
