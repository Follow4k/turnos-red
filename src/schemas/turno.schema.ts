import { z } from "zod";
import { ESPECIALIDADES } from "../models/turno.model.js";

/**
 * Especialidad en Title Case, tal como se expone en el dominio
 * ("Clínica médica", "Pediatría", "Odontología", "Nutrición").
 */
const especialidadSchema = z.enum(ESPECIALIDADES, {
  errorMap: () => ({
    message: `La especialidad debe ser una de: ${ESPECIALIDADES.join(", ")}`,
  }),
});

/**
 * El documento se admite como string o number (llega con formatos distintos
 * según la sede) pero siempre se normaliza a string para el resto de la app.
 */
const documentoSchema = z
  .union([z.string(), z.number()], { errorMap: () => ({ message: "El documento debe ser texto o número" }) })
  .transform((valor) => String(valor).trim())
  .refine((valor) => valor.length > 0, { message: "El documento no puede estar vacío" });

const fechaSchema = z
  .string({ required_error: "La fecha es obligatoria" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato ISO AAAA-MM-DD (ej. 2026-08-15)");

const horaSchema = z
  .string({ required_error: "La hora es obligatoria" })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "La hora debe tener formato 24hs HH:mm (ej. 14:30)");

/** Body esperado en POST /turnos. */
export const turnoInputSchema = z.object({
  paciente: z.string({ required_error: "El paciente es obligatorio" }).trim().min(1, "El paciente es obligatorio"),
  documento: documentoSchema,
  especialidad: especialidadSchema,
  fecha: fechaSchema,
  hora: horaSchema,
  confirmado: z.boolean({ required_error: "confirmado es obligatorio y debe ser boolean" }),
  observaciones: z.string().trim().min(1).optional(),
  medicoId: z.number().int().positive("medicoId debe ser un entero positivo").optional(),
});

/** Body esperado en PUT /turnos/:id — mismos campos, todos opcionales. */
export const turnoUpdateSchema = turnoInputSchema.partial();

/** Query params esperados en GET /turnos (?especialidad=&fecha=&medicoId=). */
export const turnoQuerySchema = z.object({
  especialidad: z.string().trim().min(1).optional(),
  fecha: z
    .string()
    .trim()
    .regex(/^(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})$/, "La fecha debe tener formato AAAA-MM-DD o DD/MM/AAAA")
    .optional(),
  medicoId: z.coerce.number().int().positive("medicoId debe ser un entero positivo").optional(),
});

export type TurnoInputValidado = z.infer<typeof turnoInputSchema>;
export type TurnoUpdateValidado = z.infer<typeof turnoUpdateSchema>;
export type TurnoQueryValidado = z.infer<typeof turnoQuerySchema>;
