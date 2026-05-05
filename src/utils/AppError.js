// Clase personalizada para manejo de errores en la aplicación
class AppError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail'
    this.isOperational = true

    // Capturar el stack trace para depuración
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
