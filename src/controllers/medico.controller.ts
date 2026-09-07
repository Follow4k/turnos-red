import type { NextFunction, Request, Response } from "express";
import type { MedicoInput } from "../models/medico.model.js";
import * as medicoService from "../services/medico.service.js";
import type { FiltrosMedico } from "../services/medico.service.js";
import { AppError } from "../utils/AppError.js";
import { parseId } from "../utils/parseId.js";

export function getMedicos(req: Request, res: Response, next: NextFunction): void {
  try {
    const filtros = req.query as FiltrosMedico;
    const medicos = medicoService.listarMedicos(filtros);
    res.status(200).json(medicos);
  } catch (error) {
    next(error);
  }
}

export function getMedicoPorId(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const medico = medicoService.obtenerMedicoPorId(id);
    if (!medico) {
      throw new AppError(404, `No existe un médico con id ${id}`, "MEDICO_NO_ENCONTRADO");
    }

    res.status(200).json(medico);
  } catch (error) {
    next(error);
  }
}

export function postMedico(req: Request, res: Response, next: NextFunction): void {
  try {
    const datos = req.body as MedicoInput;
    const nuevoMedico = medicoService.crearMedico(datos);
    res.status(201).json(nuevoMedico);
  } catch (error) {
    next(error);
  }
}

export function putMedico(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const medicoActualizado = medicoService.actualizarMedico(id, req.body as Partial<MedicoInput>);
    if (!medicoActualizado) {
      throw new AppError(404, `No existe un médico con id ${id}`, "MEDICO_NO_ENCONTRADO");
    }

    res.status(200).json(medicoActualizado);
  } catch (error) {
    next(error);
  }
}

export function deleteMedico(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    const eliminado = medicoService.eliminarMedico(id);
    if (!eliminado) {
      throw new AppError(404, `No existe un médico con id ${id}`, "MEDICO_NO_ENCONTRADO");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
