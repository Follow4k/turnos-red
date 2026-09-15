import type { Request, Response } from "express";
import type { TurnoInput } from "../models/turno.model.js";
import * as medicoService from "../services/medico.service.js";
import * as turnoService from "../services/turno.service.js";
import type { FiltrosTurno } from "../services/turno.service.js";
import { AppError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";
import { construirCuerpoError, resolverStatus } from "../utils/responderError.js";

/** Lanza un error 400 si se referencia un medicoId que no existe en /medicos. */
function validarMedicoReferenciado(medicoId: number | undefined): void {
  if (medicoId !== undefined && !medicoService.existeMedico(medicoId)) {
    throw new AppError(400, `No existe un médico con id ${medicoId}`, "MEDICO_INEXISTENTE");
  }
}

export async function getTurnos(req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    const filtros = req.query as FiltrosTurno;
    const turnos = turnoService.listarTurnos(filtros);
    return res.status(status).json(turnos);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function getTurnoPorId(req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const turno = turnoService.obtenerTurnoPorId(id);
    if (!turno) {
      throw new AppError(404, `No existe un turno con id ${id}`, "TURNO_NO_ENCONTRADO");
    }

    return res.status(status).json(turno);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function postTurno(req: Request, res: Response): Promise<Response> {
  let status = 201;
  try {
    const datos = req.body as TurnoInput;
    validarMedicoReferenciado(datos.medicoId);

    const nuevoTurno = turnoService.crearTurno(datos);
    return res.status(status).json(nuevoTurno);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function putTurno(req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const datos = req.body as Partial<TurnoInput>;
    validarMedicoReferenciado(datos.medicoId);

    const turnoActualizado = turnoService.actualizarTurno(id, datos);
    if (!turnoActualizado) {
      throw new AppError(404, `No existe un turno con id ${id}`, "TURNO_NO_ENCONTRADO");
    }

    return res.status(status).json(turnoActualizado);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function deleteTurno(req: Request, res: Response): Promise<Response> {
  let status = 204;
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const eliminado = turnoService.eliminarTurno(id);
    if (!eliminado) {
      throw new AppError(404, `No existe un turno con id ${id}`, "TURNO_NO_ENCONTRADO");
    }

    return res.status(status).send();
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}
