import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

/**
 * Red de contención final. Con la Actividad 3, cada controller resuelve y
 * responde sus propios errores (try/catch interno), así que este handler
 * solo se activa para lo que ocurre *fuera* de un controller: errores del
 * middleware de validación de Zod (`validate.middleware.ts`) o cualquier
 * excepción realmente inesperada que llegue a `next(error)`.
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
