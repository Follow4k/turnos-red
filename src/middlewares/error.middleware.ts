import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

/** 404 uniforme para cualquier ruta no definida. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 404,
    message: `No existe la ruta ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
    details: [],
  });
}

/**
 * Manejador de errores centralizado. Unifica todas las respuestas fallidas
 * de la API bajo una única estructura JSON:
 *
 * { "status": ..., "message": ..., "code": ..., "details": [] }
 *
 * `AppError` (lanzado desde controladores/middlewares de validación) define
 * su propio status/code/details; cualquier otro error se trata como 500 sin
 * exponer detalles internos al cliente.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    status: 500,
    message: "Error interno del servidor",
    code: "INTERNAL_SERVER_ERROR",
    details: [],
  });
}
