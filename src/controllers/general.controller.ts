import type { Request, Response } from "express";

/** Endpoint de bienvenida (Hello World) de la API. */
export async function getBienvenida(_req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    return res.status(status).json({
      mensaje: "API TurnosRed activa",
      docs: "GET /turnos, GET /medicos",
    });
  } catch (error) {
    status = 500;
    console.error(error);
    return res.status(status).json({
      status,
      message: "Error interno del servidor",
      code: "INTERNAL_SERVER_ERROR",
      details: [],
    });
  }
}

/** Middleware para cualquier ruta no contemplada por la aplicación (404). */
export async function manejarRutaNoEncontrada(req: Request, res: Response): Promise<Response> {
  const status = 404;
  return res.status(status).json({
    status,
    message: `No existe la ruta ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
    details: [],
  });
}
