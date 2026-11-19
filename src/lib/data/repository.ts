import type {
  Ajustes, Bloqueo, Clase, FotoGaleria, InscripcionClase, InscripcionTorneo, Instructor, MensajeContacto,
  Mesa, Partido, Reserva, SesionClase, SolicitudEvento, Torneo,
} from "../types";

/** Error de negocio con mensaje apto para mostrar al usuario. */
export class ErrorNegocio extends Error {
  constructor(message: string, public codigo: "conflicto" | "sin_cupos" | "no_encontrado" | "invalido" = "invalido") {
    super(message);
  }
}

export type NuevaReserva = Omit<Reserva, "id" | "codigo" | "historial" | "creadaEn">;

/**
 * Contrato de persistencia. Lo implementan DemoStore (archivo local) y SupabaseStore.
 * Las operaciones de creación DEBEN re-verificar disponibilidad/cupos de forma atómica.
 */
export interface Repositorio {
  // Ajustes
  obtenerAjustes(): Promise<Ajustes>;
  guardarAjustes(a: Partial<Ajustes>): Promise<Ajustes>;

  // Mesas
  listarMesas(): Promise<Mesa[]>;
  guardarMesa(m: Omit<Mesa, "id"> & { id?: string }): Promise<Mesa>;

  // Bloqueos
  listarBloqueos(desde: string, hasta: string): Promise<Bloqueo[]>;
  crearBloqueo(b: Omit<Bloqueo, "id">): Promise<Bloqueo>;
  eliminarBloqueo(id: string): Promise<void>;

  // Reservas
  listarReservas(desde: string, hasta: string): Promise<Reserva[]>;
  listarReservasRecientes(limite: number): Promise<Reserva[]>;
  /** Re-verifica solapamientos y bloqueos dentro de una operación atómica. */
  crearReserva(r: NuevaReserva): Promise<Reserva>;
  obtenerReservaPorCodigo(codigo: string): Promise<Reserva | null>;
  actualizarReserva(
    id: string,
    cambios: Partial<Pick<Reserva, "estado" | "observaciones" | "inicio" | "fin" | "mesaId">>,
    accion: string,
  ): Promise<Reserva>;

  // Escuela
  listarInstructores(): Promise<Instructor[]>;
  guardarInstructor(i: Omit<Instructor, "id"> & { id?: string }): Promise<Instructor>;
  listarClases(): Promise<Clase[]>;
  guardarClase(c: Omit<Clase, "id"> & { id?: string }): Promise<Clase>;
  listarSesiones(claseId?: string): Promise<SesionClase[]>;
  guardarSesion(s: Omit<SesionClase, "id"> & { id?: string }): Promise<SesionClase>;
  eliminarSesion(id: string): Promise<void>;
  listarInscripcionesClase(): Promise<InscripcionClase[]>;
  /** Verifica cupos de forma atómica. */
  inscribirClase(i: Omit<InscripcionClase, "id" | "codigo" | "creadaEn" | "estado" | "claseId">): Promise<InscripcionClase>;
  actualizarInscripcionClase(id: string, estado: InscripcionClase["estado"]): Promise<void>;

  // Torneos
  listarTorneos(): Promise<Torneo[]>;
  guardarTorneo(t: Omit<Torneo, "id"> & { id?: string }): Promise<Torneo>;
  listarInscripcionesTorneo(torneoId?: string): Promise<InscripcionTorneo[]>;
  inscribirTorneo(i: Omit<InscripcionTorneo, "id" | "codigo" | "creadaEn" | "estado">): Promise<InscripcionTorneo>;
  actualizarInscripcionTorneo(id: string, estado: InscripcionTorneo["estado"]): Promise<void>;
  listarPartidos(torneoId: string): Promise<Partido[]>;
  guardarPartidos(torneoId: string, partidos: Omit<Partido, "id" | "torneoId">[]): Promise<Partido[]>;

  // Eventos y contacto
  crearSolicitudEvento(s: Omit<SolicitudEvento, "id" | "codigo" | "estado" | "creadaEn">): Promise<SolicitudEvento>;
  listarSolicitudesEvento(): Promise<SolicitudEvento[]>;
  actualizarSolicitudEvento(id: string, cambios: Partial<Pick<SolicitudEvento, "estado" | "notas">>): Promise<void>;
  crearMensaje(m: Omit<MensajeContacto, "id" | "leido" | "creadoEn">): Promise<void>;
  listarMensajes(): Promise<MensajeContacto[]>;
  marcarMensajeLeido(id: string): Promise<void>;

  // Galería
  listarGaleria(): Promise<FotoGaleria[]>;
  guardarFoto(f: Omit<FotoGaleria, "id"> & { id?: string }): Promise<FotoGaleria>;
  eliminarFoto(id: string): Promise<void>;
  subirArchivo(nombre: string, datos: ArrayBuffer, tipo: string): Promise<string>;
}
