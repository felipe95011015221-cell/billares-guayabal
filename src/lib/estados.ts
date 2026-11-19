import type { EstadoReserva } from "./types";

export const ESTADO_RESERVA_UI: Record<EstadoReserva, { texto: string; tono: "ok" | "alerta" | "error" | "neutro" | "oro" }> = {
  pendiente: { texto: "Solicitud pendiente de confirmación", tono: "alerta" },
  confirmada: { texto: "Confirmada", tono: "ok" },
  en_curso: { texto: "En curso", tono: "oro" },
  finalizada: { texto: "Finalizada", tono: "neutro" },
  cancelada: { texto: "Cancelada", tono: "error" },
  rechazada: { texto: "No aprobada", tono: "error" },
};
