import cors from "cors";
import express, { type Application } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { getBienvenida, manejarRutaNoEncontrada } from "./controllers/general.controller.js";
import { errorHandler } from "./middlewares/error.middleware.js";
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

  app.get("/", getBienvenida);

  app.use(turnoRouter);
  app.use(medicoRouter);

  // Middleware para cualquier ruta no contemplada por la aplicación (404),
  // resuelto a través del controller general.
  app.use(manejarRutaNoEncontrada);

  // Red de contención: errores que no se resolvieron dentro de un controller
  // (ej. el middleware de validación de Zod).
  app.use(errorHandler);

  return app;
}
