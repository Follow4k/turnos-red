import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { medicoRouter } from "./routes/medico.routes.js";
import { turnoRouter } from "./routes/turno.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function crearApp(): Application {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  // Cliente HTML mínimo para verificar los eventos de Socket.IO sin recargar
  // la página (ver consigna 10 / evidencia del informe técnico).
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({ mensaje: "API TurnosRed activa", docs: "GET /turnos, GET /medicos" });
  });

  app.use(turnoRouter);
  app.use(medicoRouter);

  // 404 uniforme para cualquier ruta no definida.
  app.use(notFoundHandler);

  // Manejador de errores centralizado (formato estándar {status, message, code, details}).
  app.use(errorHandler);

  return app;
}
