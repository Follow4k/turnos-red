import type { Especialidad } from "./turno.model.js";

/**
 * Registro de dominio del recurso Médico. Permite vincular cada turno
 * con el profesional correspondiente a través de `Turno.medicoId`.
 */
export interface Medico {
  id: number;
  nombre: string;
  especialidad: Especialidad;
  matricula: string;
  disponible: boolean;
}

/** Forma del body esperado al crear/actualizar un médico. */
export type MedicoInput = Omit<Medico, "id">;
