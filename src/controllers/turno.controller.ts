import type { Request, Response } from "express";
import type { TurnoInput } from "../models/turno.model.js";
import * as turnoService from "../services/turno.service.js";

function parseId(param: string): number | null {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Validación mínima del body para creación/actualización de un turno. */
function esTurnoInputValido(body: unknown): body is TurnoInput {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.paciente === "string" &&
    typeof b.documento === "string" &&
    typeof b.especialidad === "string" &&
    typeof b.fecha === "string" &&
    typeof b.hora === "string" &&
    typeof b.confirmado === "boolean"
  );
}

export function getTurnos(_req: Request, res: Response): void {
  try {
    const turnos = turnoService.listarTurnos();
    res.status(200).json(turnos);
  } catch (error) {
    res.status(500).json({ error: "Error interno al listar los turnos", detalle: String(error) });
  }
}

export function getTurnoPorId(req: Request, res: Response): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "El id debe ser un número entero positivo" });
      return;
    }

    const turno = turnoService.obtenerTurnoPorId(id);
    if (!turno) {
      res.status(404).json({ error: `No existe un turno con id ${id}` });
      return;
    }

    res.status(200).json(turno);
  } catch (error) {
    res.status(500).json({ error: "Error interno al buscar el turno", detalle: String(error) });
  }
}

export function postTurno(req: Request, res: Response): void {
  try {
    if (!esTurnoInputValido(req.body)) {
      res.status(400).json({ error: "Body inválido: faltan campos obligatorios o tienen tipo incorrecto" });
      return;
    }

    const nuevoTurno = turnoService.crearTurno(req.body);
    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(500).json({ error: "Error interno al crear el turno", detalle: String(error) });
  }
}

export function putTurno(req: Request, res: Response): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "El id debe ser un número entero positivo" });
      return;
    }

    const turnoActualizado = turnoService.actualizarTurno(id, req.body as Partial<TurnoInput>);
    if (!turnoActualizado) {
      res.status(404).json({ error: `No existe un turno con id ${id}` });
      return;
    }

    res.status(200).json(turnoActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error interno al actualizar el turno", detalle: String(error) });
  }
}

export function deleteTurno(req: Request, res: Response): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      res.status(400).json({ error: "El id debe ser un número entero positivo" });
      return;
    }

    const eliminado = turnoService.eliminarTurno(id);
    if (!eliminado) {
      res.status(404).json({ error: `No existe un turno con id ${id}` });
      return;
    }

    res.status(200).json({ mensaje: `Turno ${id} eliminado correctamente` });
  } catch (error) {
    res.status(500).json({ error: "Error interno al eliminar el turno", detalle: String(error) });
  }
}
