// Importar Router de Express para definir rutas
const { Router } = require('express')
// Crear instancia del router
const router = Router()
// Importar middleware para verificar token JWT
const verificarToken = require('../middleware/verificarToken')
// Importar middleware para verificar roles de usuario
const verificarRol = require('../middleware/verificarRol')
// Importar todas las funciones del controlador de películas
const {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  listarResenas,
  crearResena
} = require('../controllers/peliculasController')

// ==================== RUTAS PÚBLICAS (sin autenticación) ====================

// GET /api/peliculas - Listar todas las películas
// Público: cualquier usuario puede ver el catálogo
router.get('/', listarPeliculas)

// GET /api/peliculas/:id - Obtener una película por ID
// Público: cualquier usuario puede ver detalles de una película
router.get('/:id', obtenerPelicula)

// GET /api/peliculas/:id/resenas - Listar reseñas de una película
// Público: cualquier usuario puede ver las reseñas
router.get('/:id/resenas', listarResenas)

// ==================== RUTAS PROTEGIDAS (cualquier usuario autenticado) ====================

// POST /api/peliculas - Crear una nueva película
// Protegido: requiere token JWT válido de cualquier usuario
// verificarToken valida el token antes de ejecutar crearPelicula
router.post('/', verificarToken, crearPelicula)

// POST /api/peliculas/:id/resenas - Crear una reseña
// Protegido: requiere token JWT válido de cualquier usuario
// El usuario ID se obtiene del token en el controlador
router.post('/:id/resenas', verificarToken, crearResena)

// ==================== RUTAS PROTEGIDAS (solo admin) ====================

// PUT /api/peliculas/:id - Actualizar una película
// Protegido: requiere token JWT válido Y rol de admin
// verificarToken valida el token, verificarRol('admin') verifica el rol
router.put('/:id', verificarToken, verificarRol('admin'), actualizarPelicula)

// DELETE /api/peliculas/:id - Eliminar una película
// Protegido: requiere token JWT válido Y rol de admin
// Solo los admins pueden eliminar películas
router.delete('/:id', verificarToken, verificarRol('admin'), eliminarPelicula)

// Exportar el router para montarlo en index.js
module.exports = router
