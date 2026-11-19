import { describe, expect, it } from "vitest";
import { estadoMesa, franjasDisponibles, seSolapan, validarHorario, valorEstimado } from "../src/lib/availability";
import { ajustesPorDefecto } from "../src/lib/data/defaults";
import { hoyBogota, instanteBogota, sumarDias, etiquetaMinutos } from "../src/lib/time";
import { generarCodigo, normalizarCelular } from "../src/lib/format";
import { reservaSchema } from "../src/lib/validation";
import type { Bloqueo, Mesa, Reserva } from "../src/lib/types";

const mesa = (id: string, extra: Partial<Mesa> = {}): Mesa => ({ id, nombre: id, modalidad: "carambola", tarifaHora: 12000, activa: true, mantenimiento: false, orden: 0, ...extra });
const FECHA = "2030-03-15";
const rango = (ini: number, fin: number) => ({ inicio: instanteBogota(FECHA, ini).getTime(), fin: instanteBogota(FECHA, fin).getTime() });
const reserva = (mesaId: string, ini: number, fin: number, estado: Reserva["estado"]): Reserva => ({
  id: `${mesaId}-${ini}`, codigo: "BG-TEST01", mesaId, modalidad: "carambola", inicio: instanteBogota(FECHA, ini).toISOString(), fin: instanteBogota(FECHA, fin).toISOString(),
  nombre: "x", celular: "3000000000", correo: "x@x.co", estado, valorEstimado: null, historial: [], creadaEn: "",
});

describe("solapamientos", () => {
  it("detecta cruces y permite reservas contiguas", () => {
    expect(seSolapan(rango(600, 720), rango(660, 780))).toBe(true);
    expect(seSolapan(rango(600, 720), rango(720, 840))).toBe(false); // contiguas: 10-12 y 12-14
    expect(seSolapan(rango(600, 720), rango(540, 600))).toBe(false);
  });
});

describe("estado de mesa", () => {
  const m = mesa("m1");
  it("prioriza bloqueos, luego ocupada, reservada y pendiente", () => {
    expect(estadoMesa(m, rango(600, 720), [], [])).toBe("disponible");
    expect(estadoMesa(m, rango(600, 720), [reserva("m1", 660, 780, "pendiente")], [])).toBe("pendiente");
    expect(estadoMesa(m, rango(600, 720), [reserva("m1", 660, 780, "confirmada")], [])).toBe("reservada");
    expect(estadoMesa(m, rango(600, 720), [reserva("m1", 660, 780, "en_curso")], [])).toBe("ocupada");
    const b: Bloqueo = { id: "b", mesaId: "m1", inicio: instanteBogota(FECHA, 700).toISOString(), fin: instanteBogota(FECHA, 800).toISOString(), tipo: "bloqueo" };
    expect(estadoMesa(m, rango(600, 720), [reserva("m1", 660, 780, "confirmada")], [b])).toBe("bloqueada");
  });
  it("ignora reservas canceladas o rechazadas", () => {
    expect(estadoMesa(m, rango(600, 720), [reserva("m1", 600, 720, "cancelada"), reserva("m1", 600, 720, "rechazada")], [])).toBe("disponible");
  });
  it("mesa en mantenimiento o inactiva = bloqueada", () => {
    expect(estadoMesa(mesa("m2", { mantenimiento: true }), rango(600, 720), [], [])).toBe("bloqueada");
    expect(estadoMesa(mesa("m3", { activa: false }), rango(600, 720), [], [])).toBe("bloqueada");
  });
  it("reservas de madrugada (después de medianoche) del día anterior bloquean", () => {
    // 1:00 a. m. del 16 = minuto 1500 del día operativo 15
    const r = reserva("m1", 1440, 1560, "confirmada");
    const rango16 = { inicio: instanteBogota("2030-03-16", 60).getTime(), fin: instanteBogota("2030-03-16", 120).getTime() };
    expect(estadoMesa(m, rango16, [r], [])).toBe("reservada");
  });
});

describe("reglas de horario", () => {
  const ahora = new Date(`${FECHA}T08:00:00-05:00`);
  it("respeta apertura, cierre (2 a. m.), duraciones e intervalos", () => {
    expect(validarHorario(FECHA, 540, 120, ajustesPorDefecto, ahora).ok).toBe(true);
    expect(validarHorario(FECHA, 480, 60, ajustesPorDefecto, ahora).ok).toBe(false); // antes de abrir
    expect(validarHorario(FECHA, 1500, 60, ajustesPorDefecto, ahora).ok).toBe(true); // 1:00 a. m. a 2:00 a. m.
    expect(validarHorario(FECHA, 1500, 120, ajustesPorDefecto, ahora).ok).toBe(false); // termina 3 a. m.
    expect(validarHorario(FECHA, 545, 60, ajustesPorDefecto, ahora).ok).toBe(false); // no múltiplo de 30
    expect(validarHorario(FECHA, 600, 45, ajustesPorDefecto, ahora).ok).toBe(false); // duración no permitida
  });
  it("exige anticipación mínima", () => {
    const casi = new Date(`${FECHA}T09:30:00-05:00`);
    expect(validarHorario(FECHA, 600, 60, ajustesPorDefecto, casi).ok).toBe(false); // 10:00 con 30 min de anticipación
  });
  it("calcula franjas con cantidad de mesas libres", () => {
    const mesas = [mesa("a"), mesa("b"), mesa("p", { modalidad: "pool" })];
    const franjas = franjasDisponibles({ fecha: FECHA, duracionMin: 60, modalidad: "carambola", mesas, reservas: [reserva("a", 600, 660, "confirmada")], bloqueos: [], ajustes: ajustesPorDefecto, ahora });
    expect(franjas.find((f) => f.inicioMin === 600)).toEqual({ inicioMin: 600, libres: 1, total: 2 });
    expect(franjas.find((f) => f.inicioMin === 660)?.libres).toBe(2);
    expect(franjas.at(-1)?.inicioMin).toBe(1500);
  });
});

describe("utilidades", () => {
  it("instante Bogotá es UTC-5", () => {
    expect(instanteBogota("2030-03-15", 540).toISOString()).toBe("2030-03-15T14:00:00.000Z");
    expect(hoyBogota(new Date("2030-03-16T03:00:00Z"))).toBe("2030-03-15");
    expect(sumarDias("2030-12-31", 1)).toBe("2031-01-01");
    expect(etiquetaMinutos(1500)).toBe("1:00 a. m.");
  });
  it("valor estimado solo si hay tarifa", () => {
    expect(valorEstimado(mesa("x"), 90)).toBe(18000);
    expect(valorEstimado(mesa("x", { tarifaHora: null }), 90)).toBeNull();
  });
  it("códigos únicos y legibles", () => {
    const set = new Set(Array.from({ length: 500 }, () => generarCodigo("BG")));
    expect(set.size).toBe(500);
    expect([...set][0]).toMatch(/^BG-[A-HJ-NP-Z2-9]{6}$/);
  });
  it("normaliza celulares colombianos", () => {
    expect(normalizarCelular("+57 300 123 4567")).toBe("3001234567");
    const p = reservaSchema.safeParse({ modalidad: "pool", fecha: FECHA, inicio: 600, duracion: 60, mesaId: "x", nombre: "Ana Pérez", celular: "+57 300-123-4567", correo: "A@B.CO", aceptaDatos: true });
    expect(p.success && p.data.celular).toBe("3001234567");
    expect(reservaSchema.safeParse({ modalidad: "pool", fecha: FECHA, inicio: 600, duracion: 60, mesaId: "x", nombre: "Ana", celular: "12345", correo: "a@b.co", aceptaDatos: true }).success).toBe(false);
  });
});
