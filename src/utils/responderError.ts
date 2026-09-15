import { AppError } from "./AppError.js";

/**
 * A partir de lo capturado en un catch, decide qué código de estado
 * corresponde a la respuesta. Se usa para asignar la variable `status`
 * local de cada controller antes de responder.
 */
export function resolverStatus(error: unknown): number {
  return error instanceof AppError ? error.status : 500;
}

/**
 * Arma el cuerpo JSON estándar de error ({status, message, code, details})
 * a partir de lo capturado en un catch. El `status` ya decidido por el
 * controller (vía `resolverStatus`) se repite dentro del body para que la
 * respuesta sea autocontenida.
 */
export function construirCuerpoError(
  error: unknown,
  status: number,
): { status: number; message: string; code: string; details: unknown[] } {
  if (error instanceof AppError) {
    return { status, message: error.message, code: error.code, details: error.details };
  }

  // Error inesperado (no es un AppError): no se expone el detalle interno al cliente.
  console.error(error);
  return { status, message: "Error interno del servidor", code: "INTERNAL_SERVER_ERROR", details: [] };
}
