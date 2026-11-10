import { ApiError } from '@/api/client'

/** Text shown to the admin for an error (the API's own messages are in English). */
export function errorMessage(error: unknown) {
  if (error instanceof ApiError) {
    switch (error.code) {
      // Codes sent by the API in `error.code`.
      case 'INVALID_CREDENTIALS':
        return 'Correo o contraseña incorrectos.'
      case 'NOT_ADMIN':
        return 'Esta cuenta no tiene permisos de administrador.'
      case 'INVALID_CODE':
        return 'El código es incorrecto o ya venció. Solicita uno nuevo.'
      case 'BATHROOM_TOO_CLOSE':
        return 'Ya hay un baño registrado a menos de 20 m de ese punto. Mueve el pin a otro lugar.'
    }
    // No code matched: fall back to the HTTP status (0 = the request never reached the server).
    if (error.status === 0) return 'No se pudo conectar con el servidor.'
    if (error.status === 400) return 'Revisa los datos e inténtalo de nuevo.'
    if (error.status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.'
    if (error.status === 403) return 'No tienes permisos para hacer esto.'
    if (error.status === 404) return 'No se encontró el elemento.'
    if (error.status === 429) {
      return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.'
    }
  }
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}
