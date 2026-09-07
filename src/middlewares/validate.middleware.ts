import type { NextFunction, Request, Response } from "express";
import type { ZodError, ZodTypeAny } from "zod";
import { AppError } from "../utils/AppError.js";

type FuenteValidacion = "body" | "query";

/** Traduce los issues de Zod al detalle que exige el formato estándar de errores. */
function formatearErroresZod(error: ZodError): { campo: string; mensaje: string }[] {
  return error.issues.map((issue) => ({
    campo: issue.path.length > 0 ? issue.path.join(".") : "(raíz)",
    mensaje: issue.message,
  }));
}

/**
 * Middleware de validación genérico: valida `req.body` o `req.query` contra
 * un schema de Zod. Si es válido, reemplaza la fuente original por los datos
 * ya parseados/coaccionados por Zod (ej. "true" -> true, "5" -> 5) para que
 * el controlador no tenga que volver a convertir tipos. Si no es válido,
 * delega en el manejador de errores centralizado con un 400 y el detalle de
 * qué campo falló.
 */
export function validar(schema: ZodTypeAny, fuente: FuenteValidacion = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const resultado = schema.safeParse(req[fuente]);

    if (!resultado.success) {
      next(
        new AppError(
          400,
          "Error de validación en los datos ingresados",
          "VALIDATION_ERROR",
          formatearErroresZod(resultado.error),
        ),
      );
      return;
    }

    if (fuente === "body") {
      req.body = resultado.data;
    } else {
      req.query = resultado.data as unknown as Request["query"];
    }
    next();
  };
}
