import { EventEmitter } from "node:events";
import type { Turno } from "../models/turno.model.js";

/**
 * Bus de eventos internos de la aplicación. Permite que las operaciones de
 * escritura sobre turnos (crear/actualizar/eliminar) queden desacopladas de
 * quien reacciona a ellas (Socket.IO, logs, futuras integraciones como
 * auditoría o métricas).
 */
export type TurnoEventName = "turno:creado" | "turno:actualizado" | "turno:eliminado";

interface TurnoEventPayloads {
  "turno:creado": Turno;
  "turno:actualizado": Turno;
  "turno:eliminado": { id: number };
}

class TurnoEventBus extends EventEmitter {
  emitTyped<E extends TurnoEventName>(event: E, payload: TurnoEventPayloads[E]): void {
    this.emit(event, payload);
  }

  onTyped<E extends TurnoEventName>(event: E, listener: (payload: TurnoEventPayloads[E]) => void): void {
    this.on(event, listener);
  }
}

/** Instancia única compartida por toda la aplicación. */
export const turnoEventBus = new TurnoEventBus();
