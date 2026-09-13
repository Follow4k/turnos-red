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
    │   └── error.middleware.ts       # 404 uniforme + manejador de errores centralizado
    ├── utils/
    │   ├── normalize.ts          # Normalización de datos crudos + comparación de texto sin tildes
    │   ├── AppError.ts             # Error de aplicación con status/code/details
    │   └── parseId.ts               # Helper para parsear ids numéricos de la URL
    ├── services/
    │   ├── file.service.ts        # Lectura async del archivo de turnos (fs/promises)
    │   ├── turno.service.ts        # Lógica de negocio de Turno (CRUD + filtros + eventos)
    │   └── medico.service.ts        # Lógica de negocio de Médico (CRUD + filtros)
    ├── controllers/
    │   ├── turno.controller.ts     # Controladores REST de Turno (status codes + delega errores)
    │   └── medico.controller.ts      # Controladores REST de Médico
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
el manejador de errores centralizado con un `400` y el detalle de qué campo
falló. Si pasa, el controlador (`turno.controller.ts` / `medico.controller.ts`)
llama al service correspondiente, que opera en memoria y devuelve el
resultado con el código de estado adecuado. Cada creación, actualización o
eliminación de un turno emite un evento interno (`turno:creado`,
`turno:actualizado`, `turno:eliminado`) que `socket.ts` retransmite a todos
los clientes conectados sin que necesiten hacer polling. Los médicos, al ser
un recurso de soporte (catálogo), no emiten eventos por Socket.IO.

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

### Turno

| Método   | Ruta            | Descripción                  | Códigos posibles       |
|----------|-----------------|-------------------------------|--------------------------|
| `GET`    | `/turnos`        | Lista turnos (admite filtros)  | `200`, `400`, `500`        |
| `GET`    | `/turnos/:id`     | Obtiene un turno por id         | `200`, `400`, `404`, `500` |
| `POST`   | `/turnos`         | Crea un nuevo turno              | `201`, `400`, `500`        |
| `PUT`    | `/turnos/:id`      | Actualiza (parcial) un turno      | `200`, `400`, `404`, `500` |
| `DELETE` | `/turnos/:id`       | Elimina un turno (sin body)         | `204`, `400`, `404`, `500` |

**Filtros por query params** (se combinan con AND):

```
GET /turnos?especialidad=Pediatria&fecha=14/08/2026
GET /turnos?medicoId=1
```

`especialidad` no distingue mayúsculas/tildes (`Pediatria` matchea
`Pediatría`). `fecha` acepta `AAAA-MM-DD` o `DD/MM/AAAA`.

### Ejemplo de body para `POST /turnos`

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

### Médico

| Método   | Ruta            | Descripción                  | Códigos posibles       |
|----------|-----------------|-------------------------------|--------------------------|
| `GET`    | `/medicos`        | Lista médicos (admite filtros)  | `200`, `400`, `500`        |
| `GET`    | `/medicos/:id`     | Obtiene un médico por id          | `200`, `400`, `404`, `500` |
| `POST`   | `/medicos`         | Registra un nuevo médico            | `201`, `400`, `500`        |
| `PUT`    | `/medicos/:id`      | Actualiza (parcial) un médico        | `200`, `400`, `404`, `500` |
| `DELETE` | `/medicos/:id`       | Da de baja un médico (sin body)        | `204`, `400`, `404`, `500` |

**Filtros por query params:**

```
GET /medicos?especialidad=Odontologia&disponible=true
```

### Ejemplo de body para `POST /medicos`

```json
{
  "nombre": "Dra. Carla Núñez",
  "especialidad": "Pediatría",
  "matricula": "MP-99887",
  "disponible": true
}
```

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

