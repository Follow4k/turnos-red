import { Router } from "express";
import {
  deleteTurno,
  getTurnoPorId,
  getTurnos,
  postTurno,
  putTurno,
} from "../controllers/turno.controller.js";

export const turnoRouter = Router();

turnoRouter.get("/turnos", getTurnos);
turnoRouter.get("/turnos/:id", getTurnoPorId);
turnoRouter.post("/turnos", postTurno);
turnoRouter.put("/turnos/:id", putTurno);
turnoRouter.delete("/turnos/:id", deleteTurno);
