# TurnosRed

Backend para centralizar la gestión de turnos de varios centros de atención
ambulatoria (clínica médica, pediatría, odontología y nutrición). Cada sede
envía sus registros en archivos JSON con formatos inconsistentes; esta API
los normaliza, expone un CRUD REST y retransmite los cambios en tiempo real
por Socket.IO.

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

# 3. Instalar las dependencias
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
├── public/
│   └── index.html          # Cliente mínimo de prueba para Socket.IO
└── src/
    ├── server.ts            # Punto de entrada: crea el servidor HTTP + Socket.IO
    ├── app.ts                # Configuración de la app Express (middlewares, rutas)
    ├── config/
    │   └── env.ts             # Carga y valida las variables de entorno
    ├── data/
    │   └── turnos.json         # Datos crudos de ejemplo (formatos inconsistentes)
    ├── models/
    │   └── turno.model.ts       # Interfaces TurnoCrudo y Turno (dominio)
    ├── utils/
    │   └── normalize.ts          # Normalización y validación de datos crudos
    ├── services/
    │   ├── file.service.ts        # Lectura async del archivo de turnos (fs/promises)
    │   └── turno.service.ts        # Lógica de negocio (CRUD en memoria + eventos)
    ├── controllers/
    │   └── turno.controller.ts     # Controladores REST (request/response + status codes)
    ├── routes/
    │   └── turno.routes.ts          # Definición de rutas /turnos
    ├── events/
    │   └── eventBus.ts               # Bus de eventos internos (EventEmitter)
    └── sockets/
        └── socket.ts                  # Integración de Socket.IO con el EventEmitter interno
```

**Flujo de datos:** `server.ts` levanta el servidor y llama a
`inicializarTurnos()`, que lee `turnos.json` de forma asíncrona
(`file.service.ts`), normaliza cada registro (`normalize.ts`) e informa por
consola cuántos fueron aceptados y cuántos rechazados. Las rutas REST
(`turno.routes.ts` → `turno.controller.ts` → `turno.service.ts`) operan sobre
esos datos en memoria. Cada creación, actualización o eliminación emite un
evento interno (`turno:creado`, `turno:actualizado`, `turno:eliminado`) que
`socket.ts` retransmite a todos los clientes conectados (`turno:nuevo`,
`turno:actualizado`, `turno:eliminado`) sin que necesiten hacer polling.

## Endpoints

| Método   | Ruta            | Descripción                  | Códigos posibles       |
|----------|-----------------|-------------------------------|--------------------------|
| `GET`    | `/turnos`        | Lista todos los turnos         | `200`, `500`              |
| `GET`    | `/turnos/:id`     | Obtiene un turno por id         | `200`, `400`, `404`, `500` |
| `POST`   | `/turnos`         | Crea un nuevo turno              | `201`, `400`, `500`        |
| `PUT`    | `/turnos/:id`      | Actualiza un turno existente      | `200`, `400`, `404`, `500` |
| `DELETE` | `/turnos/:id`       | Elimina un turno                   | `200`, `400`, `404`, `500` |

### Ejemplo de body para `POST /turnos`

```json
{
  "paciente": "Julia Torres",
  "documento": "30111222",
  "especialidad": "PEDIATRIA",
  "fecha": "2026-09-01",
  "hora": "10:30",
  "confirmado": true
}
```
