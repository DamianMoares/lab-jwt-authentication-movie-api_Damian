// Importar Router de Express para definir rutas
const { Router } = require('express')
// Crear instancia del router
const router = Router()
// Importar funciones del controlador de autenticación
const { registro, login, perfil } = require('../controllers/authController')
// Importar middleware para verificar token JWT
const verificarToken = require('../middleware/verificarToken')

// POST /api/auth/registro - Crea un nuevo usuario
// Público: no requiere autenticación
router.post('/registro', registro)

// POST /api/auth/login - Inicia sesión y devuelve token JWT
// Público: no requiere autenticación
router.post('/login', login)

// GET /api/auth/perfil - Obtiene perfil del usuario autenticado
// Protegido: requiere token JWT válido
// El middleware verificarToken se ejecuta antes del controlador perfil
router.get('/perfil', verificarToken, perfil)

// Exportar el router para montarlo en index.js
module.exports = router
