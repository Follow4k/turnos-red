import type { Request, Response } from "express";
import type { MedicoInput } from "../models/medico.model.js";
import * as medicoService from "../services/medico.service.js";
import type { FiltrosMedico } from "../services/medico.service.js";
import { AppError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";
import { construirCuerpoError, resolverStatus } from "../utils/responderError.js";

export async function getMedicos(req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    const filtros = req.query as FiltrosMedico;
    const medicos = medicoService.listarMedicos(filtros);
    return res.status(status).json(medicos);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function getMedicoPorId(req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const medico = medicoService.obtenerMedicoPorId(id);
    if (!medico) {
      throw new AppError(404, `No existe un médico con id ${id}`, "MEDICO_NO_ENCONTRADO");
    }

    return res.status(status).json(medico);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function postMedico(req: Request, res: Response): Promise<Response> {
  let status = 201;
  try {
    const datos = req.body as MedicoInput;
    const nuevoMedico = medicoService.crearMedico(datos);
    return res.status(status).json(nuevoMedico);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function putMedico(req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const medicoActualizado = medicoService.actualizarMedico(id, req.body as Partial<MedicoInput>);
    if (!medicoActualizado) {
      throw new AppError(404, `No existe un médico con id ${id}`, "MEDICO_NO_ENCONTRADO");
    }

    return res.status(status).json(medicoActualizado);
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}

export async function deleteMedico(req: Request, res: Response): Promise<Response> {
  let status = 204;
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const eliminado = medicoService.eliminarMedico(id);
    if (!eliminado) {
      throw new AppError(404, `No existe un médico con id ${id}`, "MEDICO_NO_ENCONTRADO");
    }

    return res.status(status).send();
  } catch (error) {
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status));
  }
}
