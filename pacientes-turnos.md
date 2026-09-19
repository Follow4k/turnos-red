# Módulo de Pacientes y Turnos Médicos (mockup)

> **Estado: propuesta de diseño, no implementada.** Este documento es el
> mockup técnico que el equipo de Frontend puede usar para avanzar con la
> pantalla de gestión de pacientes y asignación de turnos, mientras el
> backend implementa estos endpoints en una próxima actividad. Sigue la
> misma arquitectura en capas (`routes → controllers → services → models`),
> las mismas convenciones de validación (Zod) y el mismo
> [formato estándar de errores](./README.md#formato-estándar-de-errores) que
> ya están en producción para `Turno` y `Medico` (ver `README.md`).

## 1. Contexto

Hasta ahora, `TurnosRed` modela el turno como un dato suelto: un turno
guarda el **nombre** del paciente como texto libre (`paciente: string`) y su
documento, pero no existe un registro real de "paciente" como entidad —no
hay forma de listar los turnos históricos de una misma persona, ni de
validar que dos turnos con el mismo DNI correspondan al mismo paciente.

Este módulo introduce el recurso **Paciente** como entidad propia, y
propone **Turno Médico** como la evolución del actual `Turno`: la misma
información de especialidad/fecha/hora/médico, pero referenciando un
`pacienteId` en lugar de guardar el nombre como texto suelto.

## 2. Modelado de datos

### 2.1 Paciente

Los datos mínimos e indispensables para registrar un paciente son los que
permiten identificarlo sin ambigüedad y poder contactarlo para confirmar o
recordar un turno:

- **`dni`** — identifica al paciente de forma única. Se modela como
  `string` (no `number`) por la misma razón que `documento` en `Turno`:
  admite ceros a la izquierda y formatos con puntos, que se normalizan al
  guardar.
- **`nombre` / `apellido`** — separados (en vez de un campo `nombreCompleto`
  único) para poder ordenar/buscar por apellido, que es el criterio más
  común en un sistema de salud.
- **`fechaNacimiento`** — en formato ISO (`AAAA-MM-DD`), igual que `fecha`
  en `Turno`, para mantener un único formato de fecha en toda la API.
- **Datos de contacto** (`telefono`, `email`) — se piden ambos como
  opcionales, pero se exige al menos uno de los dos (si no hay forma de
  contactar al paciente, no tiene sentido poder asignarle un turno).

```typescript
// src/models/paciente.model.ts

/** Registro de dominio del recurso Paciente. */
export interface Paciente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  /** Fecha de nacimiento en formato ISO (AAAA-MM-DD) */
  fechaNacimiento: string;
  telefono?: string;
  email?: string;
}

/** Forma del body esperado al crear/actualizar un paciente. */
export type PacienteInput = Omit<Paciente, "id">;
```

```typescript
// src/schemas/paciente.schema.ts (boceto)
import { z } from "zod";

export const pacienteInputSchema = z
  .object({
    dni: z.string().trim().min(1, "El DNI es obligatorio"),
    nombre: z.string().trim().min(1, "El nombre es obligatorio"),
    apellido: z.string().trim().min(1, "El apellido es obligatorio"),
    fechaNacimiento: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato ISO AAAA-MM-DD"),
    telefono: z.string().trim().min(1).optional(),
    email: z.string().trim().email("El email no es válido").optional(),
  })
  // Requiere al menos un dato de contacto.
  .refine((datos) => datos.telefono !== undefined || datos.email !== undefined, {
    message: "Debe informarse al menos un dato de contacto (telefono o email)",
    path: ["telefono"],
  });
```

### 2.2 Turno Médico

`TurnoMedico` reutiliza el tipo `Especialidad` ya definido en
`turno.model.ts` (Title Case: `"Clínica médica"`, `"Pediatría"`,
`"Odontología"`, `"Nutrición"`) y el mismo formato de `fecha`/`hora` que el
`Turno` actual, pero cambia el campo `paciente: string` por una referencia
real `pacienteId: number` — igual que ya se hizo con `medicoId` en la
Actividad 2.

```typescript
// src/models/turno-medico.model.ts

import type { Especialidad } from "./turno.model.js";

/** Registro de dominio del recurso Turno Médico. */
export interface TurnoMedico {
  id: number;
  pacienteId: number;
  medicoId: number;
  especialidad: Especialidad;
  /** Fecha en formato ISO (AAAA-MM-DD) */
  fecha: string;
  /** Hora en formato 24hs HH:mm */
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}

/** Forma del body esperado al crear/actualizar un turno médico. */
export type TurnoMedicoInput = Omit<TurnoMedico, "id">;
```

Al igual que con `medicoId` en `Turno`, tanto `pacienteId` como `medicoId`
se validan por existencia antes de crear el turno médico (no solo por tipo):
si cualquiera de los dos ids no corresponde a un registro real, la API
responde `400` en vez de crear un turno "huérfano".

## 3. Endpoints propuestos

### `POST /pacientes`

Registra un nuevo paciente.

- **Body (JSON):**
  ```json
  {
    "dni": "30111222",
    "nombre": "Julia",
    "apellido": "Torres",
    "fechaNacimiento": "1990-04-12",
    "telefono": "+54 9 11 5555-1234"
  }
  ```
- **Respuesta exitosa — `201 Created`**
  ```json
  {
    "id": 1,
    "dni": "30111222",
    "nombre": "Julia",
    "apellido": "Torres",
    "fechaNacimiento": "1990-04-12",
    "telefono": "+54 9 11 5555-1234"
  }
  ```
- **Errores posibles:**
  - `400` `VALIDATION_ERROR` — falta un campo obligatorio, formato de
    `fechaNacimiento`/`email` inválido, o no se informó ningún dato de
    contacto (`details` trae el detalle por campo, igual que en `Turno` y
    `Medico`).
  - `409` `DNI_DUPLICADO` *(a definir en la implementación real)* — ya
    existe un paciente registrado con ese DNI.

### `POST /turnos-medicos`

Asigna un nuevo turno médico a un paciente ya registrado.

- **Body (JSON):**
  ```json
  {
    "pacienteId": 1,
    "medicoId": 2,
    "especialidad": "Pediatría",
    "fecha": "2026-09-20",
    "hora": "09:15",
    "confirmado": false
  }
  ```
- **Respuesta exitosa — `201 Created`**
  ```json
  {
    "id": 1,
    "pacienteId": 1,
    "medicoId": 2,
    "especialidad": "Pediatría",
    "fecha": "2026-09-20",
    "hora": "09:15",
    "confirmado": false
  }
  ```
- **Errores posibles:**
  - `400` `VALIDATION_ERROR` — mismo tipo de validaciones que ya existen
    hoy en `POST /turnos` (especialidad, formato de fecha/hora, etc.).
  - `400` `PACIENTE_INEXISTENTE` — el `pacienteId` no corresponde a un
    paciente registrado.
  - `400` `MEDICO_INEXISTENTE` — el `medicoId` no corresponde a un médico
    registrado (mismo comportamiento que ya existe hoy en `Turno`).

## 4. Próximos pasos (fuera del alcance de esta actividad)

Para pasar de mockup a implementación real, alcanza con repetir el mismo
patrón ya usado en `Medico` (Actividad 2) y `Turno` (Actividad 3):
`paciente.model.ts` → `paciente.schema.ts` → `paciente.service.ts`
(CRUD en memoria) → `paciente.controller.ts` (funciones `async`, `status`
local, `try/catch`, `return` explícito) → `paciente.routes.ts`, y análogamente
para `turno-medico.*`; sumar ambos routers en `app.ts`; y extender la
colección de Postman con los nuevos endpoints siguiendo la misma convención
de variables (`{{baseUrl}}`, `{{pacienteId}}`).
