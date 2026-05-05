// Importar clase personalizada de errores
const AppError = require('../utils/AppError')

// Middleware para verificar roles del usuario autenticado
// Es una factory function que acepta roles permitidos como parámetros
// Uso: verificarRol('admin') o verificarRol('admin', 'moderador')
const verificarRol = (...rolesPermitidos) => {
  // Retorna el middleware real que se ejecutará en la petición
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado (req.usuario debe existir)
    // Esto requiere que verificarToken se ejecute antes
    if (!req.usuario) {
      return next(new AppError('No autenticado', 401))
    }

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new AppError(
        `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
        403  // 403 Forbidden - usuario autenticado pero sin permisos
      ))
    }

    // Si el rol es correcto, continuar al siguiente middleware/controlador
    next()
  }
}

// Exportar la factory function para usarla en los routers
module.exports = verificarRol
