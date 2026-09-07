import type { Medico, MedicoInput } from "../models/medico.model.js";
import { normalizarClave } from "../utils/normalize.js";

/**
 * "Base de datos" en memoria para este prototipo, sembrada con un médico
 * por especialidad para poder probar filtros y la relación con Turno sin
 * pasos previos.
 */
let medicos: Medico[] = [
  { id: 1, nombre: "Dra. Laura Fernández", especialidad: "Clínica médica", matricula: "MP-10234", disponible: true },
  { id: 2, nombre: "Dr. Martín Sosa", especialidad: "Pediatría", matricula: "MP-20987", disponible: true },
  { id: 3, nombre: "Dra. Valeria Ríos", especialidad: "Odontología", matricula: "MP-30456", disponible: false },
  { id: 4, nombre: "Dr. Ezequiel Paz", especialidad: "Nutrición", matricula: "MP-40678", disponible: true },
];
let siguienteId = medicos.length + 1;

export interface FiltrosMedico {
  especialidad?: string;
  disponible?: boolean;
}

export function listarMedicos(filtros: FiltrosMedico = {}): Medico[] {
  return medicos.filter((medico) => {
    if (filtros.especialidad && normalizarClave(medico.especialidad) !== normalizarClave(filtros.especialidad)) {
      return false;
    }
    if (filtros.disponible !== undefined && medico.disponible !== filtros.disponible) {
      return false;
    }
    return true;
  });
}

export function obtenerMedicoPorId(id: number): Medico | undefined {
  return medicos.find((medico) => medico.id === id);
}

/** Usado por turno.service para validar que un medicoId referenciado exista. */
export function existeMedico(id: number): boolean {
  return medicos.some((medico) => medico.id === id);
}

export function crearMedico(input: MedicoInput): Medico {
  const nuevoMedico: Medico = { id: siguienteId++, ...input };
  medicos.push(nuevoMedico);
  return nuevoMedico;
}

export function actualizarMedico(id: number, input: Partial<MedicoInput>): Medico | undefined {
  const medico = obtenerMedicoPorId(id);
  if (!medico) return undefined;

  Object.assign(medico, input);
  return medico;
}

export function eliminarMedico(id: number): boolean {
  const indice = medicos.findIndex((medico) => medico.id === id);
  if (indice === -1) return false;

  medicos.splice(indice, 1);
  return true;
}
