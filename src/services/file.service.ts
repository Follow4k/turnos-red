import { readFile } from "node:fs/promises";
import type { TurnoCrudo } from "../models/turno.model.js";

/**
 * Lee y parsea el archivo de turnos crudos de forma asíncrona con
 * node:fs/promises. Este es el enfoque que usa el resto de la aplicación.
 */
export async function leerTurnosCrudos(rutaArchivo: string): Promise<TurnoCrudo[]> {
  try {
    const contenido = await readFile(rutaArchivo, "utf-8");
    const datos = JSON.parse(contenido) as TurnoCrudo[];
    return datos;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`No se pudo leer el archivo de turnos (${rutaArchivo}): ${error.message}`);
    }
    throw error;
  }
}

/* ------------------------------------------------------------------------
 * Comparación con callbacks (node:fs) — solo a modo ilustrativo.
 *
 * La misma lectura, hecha con el API clásico basado en callbacks, se vería
 * así:
 *
 *   import { readFile } from "node:fs";
 *
 *   readFile(rutaArchivo, "utf-8", (err, contenido) => {
 *     if (err) {
 *       console.error("Error al leer el archivo:", err.message);
 *       return;
 *     }
 *     try {
 *       const datos = JSON.parse(contenido);
 *       // ... acá habría que anidar cualquier otra operación asíncrona
 *       // que dependiera de "datos", generando "callback hell" a medida
 *       // que se agregan pasos.
 *     } catch (parseError) {
 *       console.error("Error al parsear el JSON:", parseError);
 *     }
 *   });
 *
 * Con callbacks, el manejo de errores se repite en cada nivel de anidación
 * y encadenar varias operaciones asíncronas (leer, validar, guardar,
 * notificar) genera funciones profundamente anidadas y difíciles de leer.
 * Con async/await + try...catch, el código se lee de arriba hacia abajo
 * como si fuera síncrono, los errores se manejan en un solo lugar y es
 * mucho más simple encadenar pasos adicionales sin aumentar el anidamiento.
 * Por eso el resto del proyecto usa node:fs/promises.
 * ---------------------------------------------------------------------- */
