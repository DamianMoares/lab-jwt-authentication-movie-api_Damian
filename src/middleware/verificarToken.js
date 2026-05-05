// Importar jsonwebtoken para verificar tokens JWT
const jwt = require('jsonwebtoken')
// Importar clase personalizada de errores
const AppError = require('../utils/AppError')

// Middleware para verificar el token JWT en el header Authorization
// Este middleware debe usarse en rutas que requieren autenticación
const verificarToken = (req, res, next) => {
  // Obtener el header Authorization de la petición
  const authHeader = req.headers.authorization

  // Verificar que el header existe y tiene el formato correcto "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token no proporcionado', 401))
  }

  // Extraer el token del header (separar por espacio y tomar la segunda parte)
  const token = authHeader.split(' ')[1]

  try {
    // Verificar la firma del token usando el secreto
    // Si el token es válido, devuelve el payload (datos del usuario)
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    
    // Guardar el payload en req.usuario para usarlo en siguientes middlewares/controladores
    req.usuario = payload
    
    // Continuar al siguiente middleware/controlador
    next()
  } catch (err) {
    // Manejar error específico de token expirado
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado', 401))
    }
    // Manejar cualquier otro error de token (firma inválida, formato incorrecto, etc.)
    return next(new AppError('Token inválido', 401))
  }
}

// Exportar el middleware para usarlo en los routers
module.exports = verificarToken
