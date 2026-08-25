import cors from "cors";
import express, { type Application, type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
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
    res.status(200).json({ mensaje: "API TurnosRed activa", docs: "GET /turnos" });
  });

  app.use(turnoRouter);

  // 404 para cualquier ruta no definida.
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Recurso no encontrado" });
  });

  // Manejador de errores centralizado.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  });

  return app;
}
