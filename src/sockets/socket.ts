import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { env } from "../config/env.js";
import { turnoEventBus } from "../events/eventBus.js";

/**
 * Crea el servidor de Socket.IO sobre el servidor HTTP existente y conecta
 * el bus de eventos interno (EventEmitter) con los clientes conectados, de
 * modo que cada cambio sobre un turno se retransmite en tiempo real sin
 * que el cliente necesite hacer polling.
 */
export function configurarSocketIO(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.corsOrigin,
    },
  });

  io.on("connection", (socket) => {
    console.log(`[socket.io] Cliente conectado: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[socket.io] Cliente desconectado: ${socket.id}`);
    });
  });

  // Puente entre el EventEmitter interno y los clientes WebSocket.
  turnoEventBus.onTyped("turno:creado", (turno) => {
    io.emit("turno:nuevo", turno);
  });

  turnoEventBus.onTyped("turno:actualizado", (turno) => {
    io.emit("turno:actualizado", turno);
  });

  turnoEventBus.onTyped("turno:eliminado", (payload) => {
    io.emit("turno:eliminado", payload);
  });

  return io;
}
