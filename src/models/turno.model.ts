/**
 * Representa un registro tal como llega desde el JSON de cada sede.
 * Los campos son deliberadamente laxos (string | number, distintos formatos
 * de fecha/hora, "si"/"no"/boolean/1 en confirmado) porque así es como
 * llegan realmente los datos: sin garantías de formato entre sedes.
 */
export interface TurnoCrudo {
  id: string | number;
  paciente: string;
  documento: string | number;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: string | boolean | number;
  observaciones?: string;
  medicoId?: string | number;
}

/**
 * Especialidades válidas dentro del dominio de la aplicación, en formato
 * Title Case (así se exponen y validan hacia afuera con Zod).
 */
export const ESPECIALIDADES = ["Clínica médica", "Pediatría", "Odontología", "Nutrición"] as const;

export type Especialidad = (typeof ESPECIALIDADES)[number];

/**
 * Registro ya normalizado y validado, con los tipos que espera el resto
 * de la aplicación (servicios, controladores, eventos).
 */
export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: Especialidad;
  /** Fecha en formato ISO (AAAA-MM-DD) */
  fecha: string;
  /** Hora en formato 24hs HH:mm */
  hora: string;
  confirmado: boolean;
  observaciones?: string;
  /** Id del Médico asignado a este turno (recurso /medicos). Opcional. */
  medicoId?: number;
}

/** Forma del body esperado al crear un turno vía POST /turnos. */
export type TurnoInput = Omit<Turno, "id">;
