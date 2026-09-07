import { z } from "zod";
import { ESPECIALIDADES } from "../models/turno.model.js";

const especialidadSchema = z.enum(ESPECIALIDADES, {
  errorMap: () => ({
    message: `La especialidad debe ser una de: ${ESPECIALIDADES.join(", ")}`,
  }),
});

/** Body esperado en POST /medicos. */
export const medicoInputSchema = z.object({
  nombre: z.string({ required_error: "El nombre es obligatorio" }).trim().min(1, "El nombre es obligatorio"),
  especialidad: especialidadSchema,
  matricula: z
    .string({ required_error: "La matrícula es obligatoria" })
    .trim()
    .min(1, "La matrícula es obligatoria"),
  disponible: z.boolean({ required_error: "disponible es obligatorio y debe ser boolean" }),
});

/** Body esperado en PUT /medicos/:id — mismos campos, todos opcionales. */
export const medicoUpdateSchema = medicoInputSchema.partial();

/** Query params esperados en GET /medicos (?especialidad=&disponible=). */
export const medicoQuerySchema = z.object({
  especialidad: z.string().trim().min(1).optional(),
  disponible: z
    .enum(["true", "false"], { errorMap: () => ({ message: "disponible debe ser 'true' o 'false'" }) })
    .optional()
    .transform((valor) => (valor === undefined ? undefined : valor === "true")),
});

export type MedicoInputValidado = z.infer<typeof medicoInputSchema>;
export type MedicoUpdateValidado = z.infer<typeof medicoUpdateSchema>;
export type MedicoQueryValidado = z.infer<typeof medicoQuerySchema>;
