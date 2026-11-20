import { siteConfig } from "@/config/site";
import { listaFotosClub } from "@/config/images";
import type { Ajustes, Clase, FotoGaleria, Mesa } from "../types";

export const ajustesPorDefecto: Ajustes = {
  modoReserva: "manual",
  duracionesMin: [60, 90, 120, 180],
  intervaloMin: 30,
  anticipacionMinimaMin: 60,
  diasMaximosAnticipacion: 30,
  horaApertura: siteConfig.horarioOperativo.apertura,
  horaCierre: siteConfig.horarioOperativo.cierre,
  politicaReservas:
    "Las reservas en línea son solicitudes sujetas a confirmación del club. Te contactaremos por WhatsApp o llamada para confirmarla. " +
    "Si no puedes asistir, avísanos con anticipación para liberar la mesa. La mesa puede liberarse si no te presentas dentro de los primeros 15 minutos.",
};

/**
 * Inventario inicial de EJEMPLO. No representa el inventario confirmado del establecimiento.
 * Ajuste nombres, cantidad, modalidad y tarifas desde /admin/mesas.
 */
export const mesasEjemplo: Omit<Mesa, "id">[] = [
  { nombre: "Mesa 1", modalidad: "carambola", tarifaHora: null, activa: true, mantenimiento: false, orden: 1 },
  { nombre: "Mesa 2", modalidad: "carambola", tarifaHora: null, activa: true, mantenimiento: false, orden: 2 },
  { nombre: "Mesa 3", modalidad: "carambola", tarifaHora: null, activa: true, mantenimiento: false, orden: 3 },
  { nombre: "Mesa 4", modalidad: "carambola", tarifaHora: null, activa: true, mantenimiento: false, orden: 4 },
  { nombre: "Mesa 5", modalidad: "pool", tarifaHora: null, activa: true, mantenimiento: false, orden: 5 },
  { nombre: "Mesa 6", modalidad: "pool", tarifaHora: null, activa: true, mantenimiento: false, orden: 6 },
];

/**
 * Programas PROPUESTOS (confirmada: false). Se publican con la etiqueta
 * "Programa propuesto · pendiente de confirmación" hasta que el club los apruebe.
 * Instructor y precio quedan por definir.
 */
export const clasesPropuestas: Omit<Clase, "id">[] = [
  {
    slug: "iniciacion-al-billar", titulo: "Iniciación al billar", modalidad: "ambas", nivel: "Iniciación", duracionMin: 90,
    descripcion: "Postura, puente, agarre del taco y primeros golpes. Para quien nunca ha jugado o quiere empezar con buenas bases.",
    instructorId: null, precio: null, confirmada: false, activa: true,
  },
  {
    slug: "carambola-tres-bandas", titulo: "Carambola a tres bandas", modalidad: "carambola", nivel: "Intermedio", duracionMin: 90,
    descripcion: "Sistemas de diamantes, lectura de bandas y elección de la bola correcta para construir la carambola.",
    instructorId: null, precio: null, confirmada: false, activa: true,
  },
  {
    slug: "pool-para-principiantes", titulo: "Pool para principiantes", modalidad: "pool", nivel: "Básico", duracionMin: 60,
    descripcion: "Reglas de bola 8 y bola 9, saque, control de la blanca y cómo planear las siguientes bolas.",
    instructorId: null, precio: null, confirmada: false, activa: true,
  },
  {
    slug: "tecnica-y-precision", titulo: "Técnica y precisión", modalidad: "ambas", nivel: "Intermedio", duracionMin: 90,
    descripcion: "Efectos, fuerza, seguimiento y retroceso. Ejercicios de repetición para un golpe más limpio y constante.",
    instructorId: null, precio: null, confirmada: false, activa: true,
  },
  {
    slug: "entrenamiento-avanzado", titulo: "Entrenamiento avanzado", modalidad: "carambola", nivel: "Avanzado", duracionMin: 120,
    descripcion: "Sesiones de alto volumen, posiciones de torneo y análisis de partidas para jugadores con experiencia competitiva.",
    instructorId: null, precio: null, confirmada: false, activa: true,
  },
  {
    slug: "clases-particulares", titulo: "Clases particulares", modalidad: "ambas", nivel: "Todos los niveles", duracionMin: 60,
    descripcion: "Una hora uno a uno, enfocada en lo que tú quieras mejorar. Horario a convenir.",
    instructorId: null, precio: null, confirmada: false, activa: true,
  },
];

/** Galería inicial: solo fotos reales del club (las de banco gratuito ya no se muestran aquí). */
export const galeriaInicial: Omit<FotoGaleria, "id">[] = listaFotosClub.map((f, i) => ({
  src: f.src,
  alt: f.alt,
  categoria: f.categoria,
  ancho: f.ancho,
  alto: f.alto,
  esReferencia: false,
  credito: "Club de Billares Guayabal",
  orden: i,
  visible: true,
}));
