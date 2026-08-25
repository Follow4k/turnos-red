import { createServer } from "node:http";
import { crearApp } from "./app.js";
import { env } from "./config/env.js";
import { configurarSocketIO } from "./sockets/socket.js";
import { inicializarTurnos } from "./services/turno.service.js";

async function main(): Promise<void> {
  try {
    await inicializarTurnos();
  } catch (error) {
    console.error("No se pudo inicializar los turnos desde el archivo de datos:", error);
    process.exit(1);
  }

  const app = crearApp();
  const httpServer = createServer(app);

  configurarSocketIO(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`[server] TurnosRed escuchando en http://localhost:${env.port}`);
  });
}

main();
