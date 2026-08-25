import "dotenv/config";

/**
 * Configuración centralizada leída desde variables de entorno.
 * Si falta alguna variable obligatoria, la aplicación falla rápido al arrancar
 * en lugar de fallar más adelante con un error difícil de rastrear.
 */
interface EnvConfig {
  port: number;
  turnosFilePath: string;
  corsOrigin: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value;
}

export const env: EnvConfig = {
  port: Number(process.env.PORT ?? 3000),
  turnosFilePath: required("TURNOS_FILE_PATH"),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
};
