import { ApiError } from "@/api/client";

/** Text shown to the user for an error (the API's own messages are in English). */
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "INVALID_CREDENTIALS") {
      return "Correo o contraseña incorrectos.";
    }
    if (error.code === "EMAIL_TAKEN") {
      return "Ya existe una cuenta con ese correo.";
    }
    if (error.code === "INVALID_CODE") {
      return "El código es incorrecto o ya venció. Solicita uno nuevo.";
    }
    if (error.status === 0) return "No se pudo conectar con el servidor.";
    if (error.status === 400) return "Revisa los datos e inténtalo de nuevo.";
    if (error.status === 401)
      return "Tu sesión expiró. Inicia sesión de nuevo.";
    if (error.status === 404) return "No se encontró el baño.";
    if (error.status === 429) {
      return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";
    }
  }
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}
