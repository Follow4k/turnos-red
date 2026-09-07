import { Router } from "express";
import {
  deleteTurno,
  getTurnoPorId,
  getTurnos,
  postTurno,
  putTurno,
} from "../controllers/turno.controller.js";
import { validar } from "../middlewares/validate.middleware.js";
import { turnoInputSchema, turnoQuerySchema, turnoUpdateSchema } from "../schemas/turno.schema.js";

export const turnoRouter = Router();

turnoRouter.get("/turnos", validar(turnoQuerySchema, "query"), getTurnos);
turnoRouter.get("/turnos/:id", getTurnoPorId);
turnoRouter.post("/turnos", validar(turnoInputSchema), postTurno);
turnoRouter.put("/turnos/:id", validar(turnoUpdateSchema), putTurno);
turnoRouter.delete("/turnos/:id", deleteTurno);
