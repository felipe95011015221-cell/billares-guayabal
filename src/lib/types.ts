export type Modalidad = "carambola" | "pool";

export const MODALIDADES: { id: Modalidad; nombre: string; descripcion: string }[] = [
  { id: "carambola", nombre: "Carambola a tres bandas", descripcion: "Mesa sin buchacas, tres bolas y la geometría de las bandas." },
  { id: "pool", nombre: "Pool", descripcion: "Mesa con buchacas, ritmo ágil y juego social." },
];

export interface Mesa {
  id: string;
  nombre: string;
  modalidad: Modalidad;
  /** Tarifa por hora en COP. null = tarifa por confirmar. */
  tarifaHora: number | null;
  activa: boolean;
  mantenimiento: boolean;
  notas?: string;
  orden: number;
}

/** pendiente = solicitud sin aprobar; confirmada = aceptada por el club; en_curso = cliente en mesa. */
export type EstadoReserva = "pendiente" | "confirmada" | "en_curso" | "finalizada" | "cancelada" | "rechazada";
export const ESTADOS_RESERVA_ACTIVOS: EstadoReserva[] = ["pendiente", "confirmada", "en_curso"];

export interface Reserva {
  id: string;
  codigo: string;
  mesaId: string;
  modalidad: Modalidad;
  /** ISO 8601 con zona (instante absoluto). */
  inicio: string;
  fin: string;
  nombre: string;
  celular: string;
  correo: string;
  estado: EstadoReserva;
  /** Valor estimado al momento de la solicitud (null si la tarifa no está confirmada). */
  valorEstimado: number | null;
  observaciones?: string;
  historial: { fecha: string; accion: string; detalle?: string }[];
  creadaEn: string;
}

export type TipoBloqueo = "bloqueo" | "ocupada" | "mantenimiento";
export interface Bloqueo {
  id: string;
  mesaId: string;
  inicio: string;
  fin: string;
  tipo: TipoBloqueo;
  motivo?: string;
}

/** Estado visual de una mesa para un rango consultado. */
export type EstadoMesa = "disponible" | "ocupada" | "bloqueada" | "reservada" | "pendiente";

export interface Instructor {
  id: string;
  nombre: string;
  bio?: string;
  activo: boolean;
}

export type Nivel = "Iniciación" | "Básico" | "Intermedio" | "Avanzado" | "Todos los niveles";

export interface Clase {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  modalidad: Modalidad | "ambas";
  nivel: Nivel;
  duracionMin: number;
  instructorId: string | null;
  precio: number | null;
  /** false = programa propuesto (se muestra con la etiqueta "Propuesta, pendiente de confirmación"). */
  confirmada: boolean;
  activa: boolean;
}

export interface SesionClase {
  id: string;
  claseId: string;
  inicio: string;
  cupos: number;
}

export type EstadoInscripcion = "pendiente" | "confirmada" | "cancelada";
export interface InscripcionClase {
  id: string;
  codigo: string;
  sesionId: string;
  claseId: string;
  nombre: string;
  celular: string;
  correo: string;
  nivelDeclarado?: string;
  estado: EstadoInscripcion;
  creadaEn: string;
}

export type EstadoTorneo = "borrador" | "inscripciones_abiertas" | "inscripciones_cerradas" | "en_juego" | "finalizado" | "cancelado";

export interface Torneo {
  id: string;
  slug: string;
  nombre: string;
  modalidad: Modalidad;
  fecha: string;
  formato: string;
  requisitos: string;
  valorInscripcion: number | null;
  cupos: number;
  estado: EstadoTorneo;
  descripcion: string;
  /** true solo cuando el club lo aprueba. Un torneo no publicado nunca se muestra al público. */
  publicado: boolean;
  /** Datos de ejemplo del modo demostración. */
  esDemo?: boolean;
}

export interface InscripcionTorneo {
  id: string;
  codigo: string;
  torneoId: string;
  nombre: string;
  celular: string;
  correo: string;
  documento?: string;
  estado: EstadoInscripcion;
  creadaEn: string;
}

export interface Partido {
  id: string;
  torneoId: string;
  ronda: number;
  orden: number;
  jugadorA: string | null;
  jugadorB: string | null;
  marcadorA: number | null;
  marcadorB: number | null;
  ganador: "A" | "B" | null;
}

export type TipoEvento = "privado" | "empresarial" | "celebracion" | "recreativo" | "grupal";
export const TIPOS_EVENTO: { id: TipoEvento; nombre: string }[] = [
  { id: "privado", nombre: "Evento privado" },
  { id: "empresarial", nombre: "Encuentro empresarial" },
  { id: "celebracion", nombre: "Celebración" },
  { id: "recreativo", nombre: "Jornada recreativa" },
  { id: "grupal", nombre: "Actividad grupal" },
];

export type EstadoSolicitud = "nueva" | "en_revision" | "aprobada" | "rechazada" | "cerrada";
export interface SolicitudEvento {
  id: string;
  codigo: string;
  tipo: TipoEvento;
  fecha: string;
  participantes: number;
  nombre: string;
  celular: string;
  correo: string;
  empresa?: string;
  mensaje?: string;
  estado: EstadoSolicitud;
  notas?: string;
  creadaEn: string;
}

export interface MensajeContacto {
  id: string;
  nombre: string;
  celular?: string;
  correo: string;
  asunto: string;
  mensaje: string;
  leido: boolean;
  creadoEn: string;
}

export interface FotoGaleria {
  id: string;
  src: string;
  alt: string;
  categoria: "pool" | "carambola" | "ambiente" | "detalle";
  ancho: number;
  alto: number;
  /** true = foto de banco (referencia), false = foto real del club. */
  esReferencia: boolean;
  credito?: string;
  urlCredito?: string;
  orden: number;
  visible: boolean;
}

export type ModoReserva = "manual" | "automatica";

/** Valores editables desde /admin/configuracion. */
export interface Ajustes {
  modoReserva: ModoReserva;
  duracionesMin: number[];
  intervaloMin: number;
  anticipacionMinimaMin: number;
  diasMaximosAnticipacion: number;
  horaApertura: number;
  horaCierre: number;
  politicaReservas: string;
  textoHero?: string;
  subtituloHero?: string;
  avisoGeneral?: string;
}
