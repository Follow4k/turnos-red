/**
 * Error de aplicación con la forma exacta que necesita el middleware de
 * errores para responder con el formato estándar de la API:
 *
 * { "status": 400, "message": "...", "code": "VALIDATION_ERROR", "details": [] }
 *
 * Se lanza desde controladores y middlewares de validación; el manejador
 * centralizado (`error.middleware.ts`) se encarga de traducirlo a la
 * respuesta HTTP.
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown[];

  constructor(status: number, message: string, code: string, details: unknown[] = []) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
