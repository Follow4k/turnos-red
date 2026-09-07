/** Convierte un parámetro de ruta a un entero positivo, o `null` si no es válido. */
export function parseId(param: string): number | null {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}
