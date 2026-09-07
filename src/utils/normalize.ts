import type { Especialidad, Turno, TurnoCrudo } from "../models/turno.model.js";

const MAPA_ESPECIALIDADES: Record<string, Especialidad> = {
  "CLINICA MEDICA": "Clínica médica",
  "CLÍNICA MÉDICA": "Clínica médica",
  PEDIATRIA: "Pediatría",
  "PEDIATRÍA": "Pediatría",
  ODONTOLOGIA: "Odontología",
  "ODONTOLOGÍA": "Odontología",
  NUTRICION: "Nutrición",
  "NUTRICIÓN": "Nutrición",
};

/** Quita espacios sobrantes y colapsa espacios internos múltiples. */
function limpiarTexto(valor: string): string {
  return valor.trim().replace(/\s+/g, " ");
}

/**
 * Normaliza una clave de comparación: quita tildes, colapsa espacios y
 * pasa a mayúsculas. Se usa para comparar especialidades ingresadas por
 * query params (ej. "Pediatria", sin tilde) contra los valores de dominio
 * en Title Case (ej. "Pediatría"), sin exigirle al usuario que escriba la
 * tilde exacta.
 */
export function normalizarClave(valor: string): string {
  return limpiarTexto(valor)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

/** Convierte "10.00", "9:30", "8.15" a formato 24hs "HH:mm". */
function normalizarHora(valor: string): string | null {
  const match = /^(\d{1,2})[.:](\d{2})$/.exec(valor.trim());
  if (!match) return null;
  const horas = Number(match[1]);
  const minutos = Number(match[2]);
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

/** Acepta "14/08/2026" (DD/MM/AAAA) o "2026-08-15" (ISO) y devuelve siempre ISO. */
export function normalizarFecha(valor: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
  if (iso) return valor.trim();

  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
  if (dmy) {
    const [, dia, mes, anio] = dmy;
    return `${anio}-${mes}-${dia}`;
  }
  return null;
}

/** Acepta "si"/"no", boolean o 0/1 y devuelve siempre boolean. */
function normalizarConfirmado(valor: string | boolean | number): boolean {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "number") return valor === 1;
  return valor.trim().toLowerCase() === "si" || valor.trim().toLowerCase() === "sí";
}

function normalizarEspecialidad(valor: string): Especialidad | null {
  return MAPA_ESPECIALIDADES[limpiarTexto(valor).toUpperCase()] ?? null;
}

/** Valida que el id resultante sea un entero positivo válido. */
function normalizarId(valor: string | number): number | null {
  const id = typeof valor === "number" ? valor : Number(valor);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export interface ResultadoNormalizacion {
  aceptados: Turno[];
  rechazados: { registro: TurnoCrudo; motivo: string }[];
}

/**
 * Transforma un arreglo de TurnoCrudo (heterogéneo, tal cual llega de las
 * sedes) en un arreglo de Turno de dominio, descartando y reportando los
 * registros que no cumplen la estructura mínima esperada.
 */
export function normalizarTurnos(crudos: TurnoCrudo[]): ResultadoNormalizacion {
  const aceptados: Turno[] = [];
  const rechazados: ResultadoNormalizacion["rechazados"] = [];

  for (const registro of crudos) {
    const id = normalizarId(registro.id);
    if (id === null) {
      rechazados.push({ registro, motivo: "id inválido (debe ser entero positivo)" });
      continue;
    }

    const especialidad = normalizarEspecialidad(registro.especialidad);
    if (especialidad === null) {
      rechazados.push({ registro, motivo: `especialidad desconocida: "${registro.especialidad}"` });
      continue;
    }

    const fecha = normalizarFecha(registro.fecha);
    if (fecha === null) {
      rechazados.push({ registro, motivo: `fecha con formato inválido: "${registro.fecha}"` });
      continue;
    }

    const hora = normalizarHora(registro.hora);
    if (hora === null) {
      rechazados.push({ registro, motivo: `hora con formato inválido: "${registro.hora}"` });
      continue;
    }

    const paciente = limpiarTexto(registro.paciente);
    if (paciente.length === 0) {
      rechazados.push({ registro, motivo: "nombre de paciente vacío" });
      continue;
    }

    aceptados.push({
      id,
      paciente,
      documento: String(registro.documento).trim(),
      especialidad,
      fecha,
      hora,
      confirmado: normalizarConfirmado(registro.confirmado),
      ...(registro.observaciones ? { observaciones: limpiarTexto(registro.observaciones) } : {}),
    });
  }

  return { aceptados, rechazados };
}
