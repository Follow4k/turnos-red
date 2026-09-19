# TurnosRed
Este es un proyecto de mi universidad que voy a ir puliendo en mi dia a dia, va a poseer varios errores y no va a estar optimizado de la mejor manera. Modificado por ultima vez 09/09
Backend para centralizar la gestión de turnos de varios centros de atención
ambulatoria (clínica médica, pediatría, odontología y nutrición). Cada sede
envía sus registros en archivos JSON con formatos inconsistentes; esta API
los normaliza, expone un CRUD REST de **Turnos** y **Médicos** con
validaciones robustas (Zod), filtros por query params, un formato estándar
de errores, y retransmite los cambios en tiempo real por Socket.IO.

## Requisitos previos

- [Node.js](https://nodejs.org/en/download) LTS (ver versión exacta en `.nvmrc`)
- [NVM](https://github.com/nvm-sh/nvm) para manejar la versión de Node
- npm (viene incluido con Node.js) — es el único gestor de paquetes de este proyecto
- Git
- Postman (o cualquier cliente HTTP equivalente) para probar la API

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd turnos-red

# 2. Usar la versión de Node.js definida en .nvmrc
nvm install
nvm use

# 3. Instalar las dependencias (incluye zod, agregado en la Actividad 2)
npm install

# 4. Crear el archivo de variables de entorno a partir del ejemplo
cp .env.example .env

# 5. Levantar el servidor en modo desarrollo (recarga automática)
npm run dev
```

El servidor queda disponible en `http://localhost:3000` (o el puerto que
hayas configurado en `.env`). La ruta `/` sirve además un cliente HTML mínimo
(`public/index.html`) que se conecta por Socket.IO y muestra en vivo los
eventos de turnos — útil para verificar la comunicación en tiempo real sin
necesidad de escribir un cliente aparte.

## Variables de entorno

| Variable            | Descripción                                                        | Ejemplo                      |
|---------------------|---------------------------------------------------------------------|-------------------------------|
| `PORT`               | Puerto en el que escucha el servidor HTTP / Socket.IO               | `3000`                        |
| `TURNOS_FILE_PATH`   | Ruta al archivo JSON con los turnos crudos de las sedes             | `./src/data/turnos.json`      |
| `CORS_ORIGIN`        | Origen permitido para CORS (front-end / cliente de sockets)         | `http://localhost:5173`       |

El archivo `.env` **no se sube al repositorio** (está en `.gitignore`); se
versiona únicamente `.env.example` como plantilla.

## Scripts disponibles

| Script           | Comando                      | Qué hace                                                                 |
|-------------------|-------------------------------|----------------------------------------------------------------------------|
| `npm run dev`      | `tsx watch src/server.ts`     | Levanta el servidor en modo desarrollo, reiniciando ante cada cambio.      |
| `npm run build`    | `tsc -p tsconfig.json`        | Compila TypeScript a JavaScript en `dist/`.                                |
| `npm start`        | `node dist/server.js`         | Ejecuta la versión ya compilada (requiere correr `build` antes).           |
| `npm run lint`     | `eslint . --ext .ts`          | Revisa el código en busca de errores y problemas de calidad.               |
| `npm run format`   | `prettier --write "src/**/*.ts"` | Aplica formato automático y consistente a todo el código fuente.        |

## Estructura de carpetas

```
turnos-red/
├── .env.example          # Plantilla de variables de entorno
├── .nvmrc                 # Versión de Node.js del proyecto
├── eslint.config.js        # Configuración de ESLint (TypeScript)
├── .prettierrc             # Configuración de Prettier
├── tsconfig.json           # Configuración del compilador de TypeScript (strict)
├── package.json
├── postman/
│   ├── turnos-red.postman_collection.json    # Colección con pruebas, Happy Path/errores y ejemplos guardados
│   └── turnos-red.postman_environment.json   # Entorno con baseUrl y token (reservado)
├── public/
│   └── index.html          # Cliente mínimo de prueba para Socket.IO
└── src/
    ├── server.ts            # Punto de entrada: crea el servidor HTTP + Socket.IO
    ├── app.ts                # Configuración de la app Express (middlewares, rutas, error handler)
    ├── config/
    │   └── env.ts             # Carga y valida las variables de entorno
    ├── data/
    │   └── turnos.json         # Datos crudos de ejemplo (formatos inconsistentes)
    ├── models/
    │   ├── turno.model.ts       # Interfaces TurnoCrudo/Turno y especialidades válidas (Title Case)
    │   └── medico.model.ts        # Interfaz Medico
    ├── schemas/
    │   ├── turno.schema.ts       # Schemas de Zod: creación, actualización y query params de Turno
    │   └── medico.schema.ts        # Schemas de Zod: creación, actualización y query params de Médico
    ├── middlewares/
    │   ├── validate.middleware.ts  # Middleware genérico que valida body/query contra un schema de Zod
    │   └── error.middleware.ts       # Red de contención: errores del middleware de Zod / no capturados
    ├── utils/
    │   ├── normalize.ts          # Normalización de datos crudos + comparación de texto sin tildes
    │   ├── AppError.ts             # Error de aplicación con status/code/details
    │   ├── responderError.ts        # Helper para armar {status,message,code,details} dentro de cada controller
    │   └── parseId.ts                # Helper para parsear ids numéricos de la URL
    ├── services/
    │   ├── file.service.ts        # Lectura async del archivo de turnos (fs/promises)
    │   ├── turno.service.ts        # Lógica de negocio de Turno (CRUD + filtros + eventos)
    │   └── medico.service.ts        # Lógica de negocio de Médico (CRUD + filtros)
    ├── controllers/
    │   ├── general.controller.ts    # Bienvenida (Hello World) y ruta no encontrada (404)
    │   ├── turno.controller.ts       # Controladores async de Turno (try/catch + status + return)
    │   └── medico.controller.ts        # Controladores async de Médico (try/catch + status + return)
    ├── routes/
    │   ├── turno.routes.ts          # Rutas /turnos (con validación de Zod)
    │   └── medico.routes.ts           # Rutas /medicos (con validación de Zod)
    ├── events/
    │   └── eventBus.ts               # Bus de eventos internos (EventEmitter)
    └── sockets/
        └── socket.ts                  # Integración de Socket.IO con el EventEmitter interno
```

**Flujo de datos:** `server.ts` levanta el servidor y llama a
`inicializarTurnos()`, que lee `turnos.json` de forma asíncrona
(`file.service.ts`), normaliza cada registro (`normalize.ts`) e informa por
consola cuántos fueron aceptados y cuántos rechazados. Las rutas REST pasan
primero por el middleware `validar()` (`validate.middleware.ts`), que corre
el schema de Zod correspondiente sobre `body` o `query`; si falla, delega en
`error.middleware.ts` con un `400` y el detalle de qué campo falló. Si pasa,
el controller correspondiente (`turno.controller.ts` / `medico.controller.ts`
/ `general.controller.ts`) llama al service correspondiente, que opera en
memoria, y responde él mismo con el código de estado adecuado (ver sección
siguiente). Cada creación, actualización o eliminación de un turno emite un
evento interno (`turno:creado`, `turno:actualizado`, `turno:eliminado`) que
`socket.ts` retransmite a todos los clientes conectados sin que necesiten
hacer polling. Los médicos, al ser un recurso de soporte (catálogo), no
emiten eventos por Socket.IO.

## Arquitectura de los controllers

Desde la Actividad 3, cada controller sigue siempre el mismo patrón:

```ts
export async function getTurnoPorId(req: Request, res: Response): Promise<Response> {
  let status = 200;
  try {
    // 1. Validaciones previas: si algo no está bien, se lanza un AppError
    //    (subclase de Error) con su propio mensaje y código de estado.
    const id = parseId(req.params.id);
    if (id === null) {
      throw new AppError(400, "El id debe ser un número entero positivo", "ID_INVALIDO");
    }

    // 2. Lógica normal (camino feliz).
    const turno = turnoService.obtenerTurnoPorId(id);
    if (!turno) {
      throw new AppError(404, `No existe un turno con id ${id}`, "TURNO_NO_ENCONTRADO");
    }

    return res.status(status).json(turno); // return explícito
  } catch (error) {
    // 3. status se reajusta acá según lo que se haya lanzado.
    status = resolverStatus(error);
    return res.status(status).json(construirCuerpoError(error, status)); // return explícito
  }
}
```

- **Función `async`** en todos los métodos exportados, aunque hoy la
  persistencia sea en memoria (preparación para una futura base de datos).
- **Variable `status` local** a cada función: arranca en el código feliz
  (`200`, `201` o `204` según el endpoint) y se reasigna dentro del `catch`
  según el error capturado.
- **`throw new AppError(...)`** (subclase de `Error`) para cortar la
  ejecución apenas una validación previa falla, en vez de seguir anidando
  `if/else`.
- **`return` explícito** en cada `res.status(status).json(...)` / `.send()`,
  para evitar que el código siga ejecutándose después de responder.
- **`try/catch` en cada controller**: la lógica de negocio y las
  validaciones previas quedan adentro del `try`; el `catch` arma la
  respuesta de error con `resolverStatus()` / `construirCuerpoError()`
  (`utils/responderError.ts`), dos helpers chiquitos para no repetir el
  mismo bloque de armado de JSON en los ~10 métodos de la API.
- **Controller general** (`general.controller.ts`): agrupa el endpoint de
  bienvenida (`GET /`) y el middleware de ruta no encontrada, siguiendo el
  mismo patrón (`async`, `status` local, `return` explícito).

`error.middleware.ts` sigue existiendo, pero ahora es solo una **red de
contención**: atiende los errores que arma `validate.middleware.ts` (que
corre *antes* de llegar a un controller) y cualquier excepción realmente
inesperada — ya no es el camino normal para los errores de negocio, que
ahora resuelve cada controller por sí mismo.

## Formato estándar de errores

Toda respuesta fallida de la API (validación, recurso no encontrado, error
interno, ruta inexistente) tiene la misma forma:

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    { "campo": "especialidad", "mensaje": "La especialidad debe ser una de: Clínica médica, Pediatría, Odontología, Nutrición" }
  ]
}
```

`code` posibles: `VALIDATION_ERROR`, `ID_INVALIDO`, `TURNO_NO_ENCONTRADO`,
`MEDICO_NO_ENCONTRADO`, `MEDICO_INEXISTENTE` (al crear/actualizar un turno
con un `medicoId` que no existe), `ROUTE_NOT_FOUND` e
`INTERNAL_SERVER_ERROR`.

## Endpoints

Todas las respuestas son JSON. Los endpoints de error siguen siempre el
["Formato estándar de errores"](#formato-estándar-de-errores) descripto
arriba — acá se documenta, por endpoint, cuáles de esos errores puede
devolver y con qué `code`.

### General

#### `GET /`

Endpoint de bienvenida / health-check informal de la API.

- **Params / Query / Body:** ninguno.
- **Respuesta exitosa — `200 OK`**
  ```json
  { "mensaje": "API TurnosRed activa", "docs": "GET /turnos, GET /medicos" }
  ```

#### Cualquier ruta no definida

- **Respuesta — `404 Not Found`**
  ```json
  {
    "status": 404,
    "message": "No existe la ruta GET /esto-no-existe",
    "code": "ROUTE_NOT_FOUND",
    "details": []
  }
  ```

### Turno

#### `GET /turnos`

Lista los turnos cargados. Sin query params devuelve todos; los filtros se
combinan con AND.

- **Query params (todos opcionales):**

  | Param          | Tipo   | Formato aceptado                     | Descripción                                   |
  |----------------|--------|----------------------------------------|-------------------------------------------------|
  | `especialidad` | string | Texto libre, sin distinguir tildes/mayúsculas (`Pediatria` matchea `Pediatría`) | Filtra por especialidad del turno |
  | `fecha`        | string | `AAAA-MM-DD` o `DD/MM/AAAA`             | Filtra por fecha exacta del turno               |
  | `medicoId`     | number | Entero positivo                         | Filtra por médico asignado                      |

- **Ejemplos:**
  ```
  GET /turnos?especialidad=Pediatria&fecha=14/08/2026
  GET /turnos?medicoId=1
  ```
- **Respuesta exitosa — `200 OK`**
  ```json
  [
    {
      "id": 1,
      "paciente": "Julia Torres",
      "documento": "30111222",
      "especialidad": "Pediatría",
      "fecha": "2026-09-01",
      "hora": "10:30",
      "confirmado": true,
      "medicoId": 1
    }
  ]
  ```
- **Errores posibles:** `400` `VALIDATION_ERROR` (un query param con formato inválido, ej. `fecha=15-13-2026`).

#### `GET /turnos/:id`

Obtiene un turno puntual por id.

- **Path params:** `id` (entero positivo).
- **Respuesta exitosa — `200 OK`**: el objeto `Turno` (mismo shape que arriba).
- **Errores posibles:**
  - `400` `ID_INVALIDO` — el `id` de la URL no es un entero positivo.
  - `404` `TURNO_NO_ENCONTRADO` — no existe un turno con ese id.

#### `POST /turnos`

Crea un nuevo turno.

- **Body (JSON):**
  ```json
  {
    "paciente": "Julia Torres",
    "documento": "30111222",
    "especialidad": "Pediatría",
    "fecha": "2026-09-01",
    "hora": "10:30",
    "confirmado": true,
    "medicoId": 1
  }
  ```
  | Campo           | Tipo               | Obligatorio | Notas                                                              |
  |------------------|---------------------|-------------|----------------------------------------------------------------------|
  | `paciente`        | string               | Sí          | Nombre del paciente (texto libre, se recorta espacios)                |
  | `documento`        | string \| number      | Sí          | Se normaliza siempre a `string`                                        |
  | `especialidad`      | string               | Sí          | Una de: `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`        |
  | `fecha`              | string               | Sí          | ISO `AAAA-MM-DD`                                                          |
  | `hora`                | string               | Sí          | 24hs `HH:mm`                                                                |
  | `confirmado`           | boolean              | Sí          | —                                                                             |
  | `observaciones`         | string               | No          | —                                                                               |
  | `medicoId`               | number               | No          | Debe corresponder a un médico existente en `/medicos`                          |

- **Respuesta exitosa — `201 Created`**: el `Turno` creado (con `id` asignado).
- **Errores posibles:**
  - `400` `VALIDATION_ERROR` — algún campo no cumple el schema de Zod (`details` trae el detalle por campo).
  - `400` `MEDICO_INEXISTENTE` — se envió `medicoId` pero no existe ese médico.

#### `PUT /turnos/:id`

Actualiza parcialmente un turno (cualquier subconjunto de los campos de `POST`).

- **Path params:** `id` (entero positivo).
- **Body (JSON):** igual que `POST /turnos` pero con todos los campos opcionales. Ejemplo típico (confirmar un turno):
  ```json
  { "confirmado": true, "observaciones": "Confirmado telefónicamente" }
  ```
- **Respuesta exitosa — `200 OK`**: el `Turno` ya actualizado.
- **Errores posibles:** `400` `VALIDATION_ERROR`, `400` `MEDICO_INEXISTENTE`, `400` `ID_INVALIDO`, `404` `TURNO_NO_ENCONTRADO`.

#### `DELETE /turnos/:id`

Elimina un turno. No admite body.

- **Path params:** `id` (entero positivo).
- **Respuesta exitosa — `204 No Content`** (sin body).
- **Errores posibles:** `400` `ID_INVALIDO`, `404` `TURNO_NO_ENCONTRADO`.

### Médico

#### `GET /medicos`

Lista los médicos cargados.

- **Query params (todos opcionales):**

  | Param          | Tipo    | Formato aceptado           | Descripción                          |
  |----------------|---------|------------------------------|------------------------------------------|
  | `especialidad` | string  | Sin distinguir tildes/mayúsculas | Filtra por especialidad del médico       |
  | `disponible`   | boolean | `"true"` \| `"false"`         | Filtra por disponibilidad                  |

- **Ejemplo:** `GET /medicos?especialidad=Odontologia&disponible=true`
- **Respuesta exitosa — `200 OK`**
  ```json
  [
    { "id": 1, "nombre": "Dra. Laura Fernández", "especialidad": "Clínica médica", "matricula": "MP-10234", "disponible": true }
  ]
  ```
- **Errores posibles:** `400` `VALIDATION_ERROR` (query param con formato inválido, ej. `disponible=si`).

#### `GET /medicos/:id`

- **Path params:** `id` (entero positivo).
- **Respuesta exitosa — `200 OK`**: el objeto `Medico`.
- **Errores posibles:** `400` `ID_INVALIDO`, `404` `MEDICO_NO_ENCONTRADO`.

#### `POST /medicos`

- **Body (JSON):**
  ```json
  { "nombre": "Dra. Carla Núñez", "especialidad": "Pediatría", "matricula": "MP-99887", "disponible": true }
  ```
  | Campo          | Tipo    | Obligatorio | Notas                                                       |
  |-----------------|---------|-------------|-----------------------------------------------------------------|
  | `nombre`          | string  | Sí          | —                                                                 |
  | `especialidad`     | string  | Sí          | Una de: `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`   |
  | `matricula`         | string  | Sí          | —                                                                   |
  | `disponible`         | boolean | Sí          | —                                                                     |

- **Respuesta exitosa — `201 Created`**: el `Medico` creado (con `id` asignado).
- **Errores posibles:** `400` `VALIDATION_ERROR`.

#### `PUT /medicos/:id`

- **Path params:** `id` (entero positivo).
- **Body (JSON):** igual que `POST /medicos` pero con todos los campos opcionales, ej. `{ "disponible": false }`.
- **Respuesta exitosa — `200 OK`**: el `Medico` actualizado.
- **Errores posibles:** `400` `VALIDATION_ERROR`, `400` `ID_INVALIDO`, `404` `MEDICO_NO_ENCONTRADO`.

#### `DELETE /medicos/:id`

- **Path params:** `id` (entero positivo).
- **Respuesta exitosa — `204 No Content`** (sin body).
- **Errores posibles:** `400` `ID_INVALIDO`, `404` `MEDICO_NO_ENCONTRADO`.

### Próximo módulo: Pacientes y Turnos Médicos (mockup)

El diseño conceptual de los endpoints `POST /pacientes` y
`POST /turnos-medicos` (todavía **no implementados**, solo propuestos)
está documentado en [`pacientes-turnos.md`](./pacientes-turnos.md).

## Validaciones (Zod)

- `especialidad` (Turno y Médico): debe ser exactamente una de
  `"Clínica médica"`, `"Pediatría"`, `"Odontología"`, `"Nutrición"`
  (Title Case).
- `documento`: admite `string` o `number` de entrada; se normaliza siempre a
  `string`.
- `fecha`: formato ISO `AAAA-MM-DD` en el body; los filtros de `GET /turnos`
  además aceptan `DD/MM/AAAA`.
- `hora`: formato 24hs `HH:mm`.
- `medicoId` (opcional en Turno): si se envía, debe corresponder a un médico
  existente en `/medicos` — si no, la API responde `400` con
  `code: "MEDICO_INEXISTENTE"`.
- Cualquier error de Zod se traduce automáticamente al formato estándar de
  errores, con un `details` por campo indicando qué falló.

## Colección de Postman

En `postman/turnos-red.postman_collection.json`:

- **Variables**: `baseUrl` (colección) + `token` reservado para una futura
  autenticación; `medicoId` y `turnoId` se sobreescriben dinámicamente vía
  script de test al crear un médico/turno (`pm.collectionVariables.set(...)`),
  y se reutilizan en las requests siguientes (`GET/PUT/DELETE :id`).
- **Pruebas automáticas**: cada request valida el código de estado y la
  forma del body con aserciones en JavaScript (`pm.test`).
- **Cobertura**: incluye Happy Path (crear/leer/actualizar/eliminar) y casos
  borde — especialidad inválida, `medicoId` inexistente, id con formato
  inválido y recurso no encontrado — para Turno y Médico.
- **Ejemplos guardados** (*Saved Responses*) en cada request, listos para
  usarse como Mock Server en Postman (Collection → Run in mock server).

`postman/turnos-red.postman_environment.json` trae `baseUrl` apuntando a
`http://localhost:3000`; importalo junto con la colección.

## Uso de Inteligencia Artificial

| Tarea | Herramienta | Prompt (resumen) | Respuesta generada | Ajuste manual aplicado |
|---|---|---|---|---|
| Middleware de errores y validación con Zod | Claude (Anthropic) | "Implementá el middleware centralizado de errores y las validaciones con Zod para Turno y Médico según la consigna de la Actividad 2, sobre el proyecto TurnosRed ya existente." | `AppError`, `validate.middleware.ts`, `error.middleware.ts` y los schemas de `turno.schema.ts` / `medico.schema.ts`. | *(completar tras revisar el código: por ejemplo, ajustar mensajes de error, agregar/quitar campos, o cambiar el código HTTP de `MEDICO_INEXISTENTE`)*. |
| CRUD del recurso Médico y vínculo con Turno | Claude (Anthropic) | "Agregá el CRUD completo de /medicos (misma arquitectura en capas que Turno) y vinculá cada turno a un médico mediante `medicoId`." | Modelo, service, controller y rutas de `medico`, más el campo `medicoId` en `Turno` y su validación de existencia. | *(completar tras revisar: por ejemplo, cambiar los campos del médico o la regla de "médico inexistente")*. |
| Filtros por query params | Claude (Anthropic) | "Implementá filtros por especialidad/fecha/medicoId en GET /turnos y por especialidad/disponible en GET /medicos, sin agregar endpoints nuevos." | Lógica de filtrado en `turno.service.ts` y `medico.service.ts`, más `normalizarClave()` para comparar especialidades sin tildes. | *(completar tras revisar)*. |
| Colección de Postman | Claude (Anthropic) | "Generá la colección de Postman (`turnos-red.postman_collection.json`) con variables de entorno, tests automáticos, casos Happy Path/Bad Request/Not Found y ejemplos guardados para Mock Server." | Colección con 19 requests entre `Turnos` y `Medicos`, variables dinámicas y ejemplos guardados. | *(completar tras correrla en tu Postman: capturas reales van en el documento de evidencia)*. |
| Refactor a Clean Architecture (Actividad 3) | Claude (Anthropic) | "Migrá los controllers de Turno y Médico a funciones async con una variable `status` local, `throw`/`try-catch` explícito y `return` en cada respuesta; sumá un controller general para el Hello World y el 404." | `general.controller.ts`, reescritura de `turno.controller.ts` / `medico.controller.ts` y el helper `utils/responderError.ts`. | *(completar tras revisar: por ejemplo, los mensajes de cada `AppError` o cómo se arma `construirCuerpoError`)*. |
| Documentación exhaustiva del README y mockup de Pacientes/Turnos Médicos (Actividad 4) | Claude (Anthropic) | "A partir de las rutas y controllers reales del proyecto, documentá cada endpoint en el README (params, body, respuestas y códigos de estado) y armá `pacientes-turnos.md` con el diseño conceptual (interfaces TS + endpoints propuestos) del módulo de Pacientes y Turnos Médicos, sin implementarlo todavía." | Sección "Endpoints" ampliada del README y el archivo `pacientes-turnos.md` completo. | *(completar tras revisar: por ejemplo, los campos elegidos para `Paciente` o el path de los endpoints propuestos)*. |


