import { Router } from "express";
import {
  deleteMedico,
  getMedicoPorId,
  getMedicos,
  postMedico,
  putMedico,
} from "../controllers/medico.controller.js";
import { validar } from "../middlewares/validate.middleware.js";
import { medicoInputSchema, medicoQuerySchema, medicoUpdateSchema } from "../schemas/medico.schema.js";

export const medicoRouter = Router();

medicoRouter.get("/medicos", validar(medicoQuerySchema, "query"), getMedicos);
medicoRouter.get("/medicos/:id", getMedicoPorId);
medicoRouter.post("/medicos", validar(medicoInputSchema), postMedico);
medicoRouter.put("/medicos/:id", validar(medicoUpdateSchema), putMedico);
medicoRouter.delete("/medicos/:id", deleteMedico);
