import { env } from "../config/env.js";
import { turnoEventBus } from "../events/eventBus.js";
import type { Turno, TurnoInput } from "../models/turno.model.js";
import { normalizarClave, normalizarFecha, normalizarTurnos } from "../utils/normalize.js";
import { leerTurnosCrudos } from "./file.service.js";

/**
 * "Base de datos" en memoria para este prototipo. Se carga una vez al
 * arrancar el servidor a partir del archivo turnos.json normalizado.
 */
let turnos: Turno[] = [];
let siguienteId = 1;

/** Carga inicial: lee el archivo crudo, normaliza y reporta el resultado por consola. */
export async function inicializarTurnos(): Promise<void> {
  const crudos = await leerTurnosCrudos(env.turnosFilePath);
  const { aceptados, rechazados } = normalizarTurnos(crudos);

  turnos = aceptados;
  siguienteId = turnos.reduce((max, t) => Math.max(max, t.id), 0) + 1;

  console.log(`[turnos] Registros aceptados: ${aceptados.length}`);
  console.log(`[turnos] Registros rechazados: ${rechazados.length}`);
  rechazados.forEach(({ registro, motivo }) => {
    console.log(`  - id="${registro.id}": ${motivo}`);
  });
}

export interface FiltrosTurno {
  especialidad?: string;
  /** Acepta AAAA-MM-DD o DD/MM/AAAA; se normaliza a ISO antes de comparar. */
  fecha?: string;
  medicoId?: number;
}

/**
 * Lista turnos aplicando filtros opcionales por especialidad, fecha o
 * médico asignado. Los filtros se combinan con AND: si se pasa más de uno,
 * el turno debe cumplir todos para aparecer en el resultado.
 */
export function listarTurnos(filtros: FiltrosTurno = {}): Turno[] {
  return turnos.filter((turno) => {
    if (filtros.especialidad && normalizarClave(turno.especialidad) !== normalizarClave(filtros.especialidad)) {
      return false;
    }

    if (filtros.fecha) {
      const fechaFiltroIso = normalizarFecha(filtros.fecha);
      if (fechaFiltroIso === null || turno.fecha !== fechaFiltroIso) return false;
    }

    if (filtros.medicoId !== undefined && turno.medicoId !== filtros.medicoId) {
      return false;
    }

    return true;
  });
}

export function obtenerTurnoPorId(id: number): Turno | undefined {
  return turnos.find((t) => t.id === id);
}

export function crearTurno(input: TurnoInput): Turno {
  const nuevoTurno: Turno = { id: siguienteId++, ...input };
  turnos.push(nuevoTurno);
  turnoEventBus.emitTyped("turno:creado", nuevoTurno);
  return nuevoTurno;
}

export function actualizarTurno(id: number, input: Partial<TurnoInput>): Turno | undefined {
  const turno = obtenerTurnoPorId(id);
  if (!turno) return undefined;

  Object.assign(turno, input);
  turnoEventBus.emitTyped("turno:actualizado", turno);
  return turno;
}

export function eliminarTurno(id: number): boolean {
  const indice = turnos.findIndex((t) => t.id === id);
  if (indice === -1) return false;

  turnos.splice(indice, 1);
  turnoEventBus.emitTyped("turno:eliminado", { id });
  return true;
}
