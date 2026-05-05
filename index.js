// Importar Express para crear el servidor
const express = require('express')
// Cargar variables de entorno desde archivo .env
require('dotenv').config()

// Importar routers de la aplicación
const authRouter = require('./src/routes/auth')
const peliculasRouter = require('./src/routes/peliculas')
// Importar clase personalizada de errores
const AppError = require('./src/utils/AppError')

// Crear instancia de la aplicación Express
const app = express()
// Obtener puerto de las variables de entorno o usar 3000 por defecto
const PORT = process.env.PORT || 3000

// ==================== MIDDLEWARES GLOBALES ====================

// Middleware para parsear el cuerpo de las peticiones como JSON
// Esto permite acceder a req.body en los controladores
app.use(express.json())

// Middleware de logging (opcional)
// Registra cada petición en la consola con método, ruta y timestamp
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`)
  next()
})

// ==================== MONTAR ROUTERS ====================

// Montar router de autenticación en /api/auth
// Todas las rutas de auth estarán bajo este prefijo
app.use('/api/auth', authRouter)

// Montar router de películas en /api/peliculas
// Todas las rutas de películas estarán bajo este prefijo
app.use('/api/peliculas', peliculasRouter)

// ==================== RUTA DE BIENVENIDA ====================

// Ruta raíz que muestra información de la API
// Útil para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Películas con Autenticación JWT',
    version: '1.0.0',
    endpoints: {
      auth: {
        registro: 'POST /api/auth/registro',
        login: 'POST /api/auth/login',
        perfil: 'GET /api/auth/perfil (requiere token)'
      },
      peliculas: {
        listar: 'GET /api/peliculas (público)',
        obtener: 'GET /api/peliculas/:id (público)',
        crear: 'POST /api/peliculas (requiere token)',
        actualizar: 'PUT /api/peliculas/:id (requiere token admin)',
        eliminar: 'DELETE /api/peliculas/:id (requiere token admin)',
        listarResenas: 'GET /api/peliculas/:id/resenas (público)',
        crearResena: 'POST /api/peliculas/:id/resenas (requiere token)'
      }
    }
  })
})

// ==================== MANEJO DE ERRORES ====================

// Middleware para rutas no encontradas (404)
// Debe ir después de todas las rutas definidas
app.use((req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404))
})

// Middleware global de manejo de errores
// Captura todos los errores que pasen a next()
app.use((err, req, res, next) => {
  // Registrar el error en la consola para depuración
  console.error('Error:', err)

  // Manejar error de validación de JSON (JSON mal formado en el cuerpo)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      mensaje: 'JSON inválido en el cuerpo de la petición'
    })
  }

  // Manejar errores operacionales (AppError)
  // Estos son errores esperados (validación, no encontrado, etc.)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      mensaje: err.message
    })
  }

  // Manejar errores desconocidos (bugs del servidor)
  // No revelamos detalles del error al cliente por seguridad
  res.status(500).json({
    status: 'error',
    mensaje: 'Error interno del servidor'
  })
})

// ==================== INICIAR SERVIDOR ====================

// Iniciar el servidor y escuchar en el puerto configurado
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`📚 Base de datos: ${process.env.DB_NAME}`)
})
