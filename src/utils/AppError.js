// Clase personalizada para manejo de errores en la aplicación
// Extiende la clase Error nativa de JavaScript para añadir funcionalidades
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)                    // Llamar al constructor de Error con el mensaje
    this.statusCode = statusCode      // Código HTTP del error (400, 401, 404, 500, etc.)
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail'  // 'error' para 4xx, 'fail' para 5xx
    this.isOperational = true         // Marca el error como operacional (esperado, no bug)

    // Capturar el stack trace para depuración
    // Esto permite ver dónde se originó el error
    Error.captureStackTrace(this, this.constructor)
  }
}

// Exportar la clase para usarla en controladores y middlewares
module.exports = AppError
