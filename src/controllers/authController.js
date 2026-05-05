// Importar bcrypt para hashear contraseñas
const bcrypt = require('bcrypt')
// Importar jsonwebtoken para generar tokens JWT
const jwt = require('jsonwebtoken')
// Importar pool de conexiones a PostgreSQL
const pool = require('../config/db')
// Importar clase personalizada de errores
const AppError = require('../utils/AppError')

// Número de rounds para bcrypt (más alto = más seguro pero más lento)
const SALT_ROUNDS = 10

// Función auxiliar para generar token JWT
// Crea un token con los datos esenciales del usuario (id, email, rol)
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,          // ID del usuario en la base de datos
      email: usuario.email,    // Email del usuario
      rol: usuario.rol         // Rol del usuario (usuario o admin)
    },
    process.env.JWT_SECRET,    // Clave secreta para firmar el token
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }  // Tiempo de expiración
  )
}

// POST /api/auth/registro - Registrar un nuevo usuario
const registro = async (req, res, next) => {
  try {
    // Extraer datos del cuerpo de la petición
    const { nombre, email, password, rol } = req.body

    // Validar que los campos obligatorios estén presentes
    if (!nombre || !email || !password) {
      throw new AppError('nombre, email y password son obligatorios', 400)
    }

    // Validar longitud mínima de la contraseña
    if (password.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres', 400)
    }

    // Verificar si el email ya está registrado en la base de datos
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existe.rows.length > 0) {
      throw new AppError('Ya existe un usuario con ese email', 409)  // 409 Conflict
    }

    // Hashear la contraseña usando bcrypt con SALT_ROUNDS
    // Esto genera un hash único incluso para la misma contraseña
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS)

    // Determinar el rol final: solo 'admin' si se especifica explícitamente
    // En producción esto debería estar más restringido
    const rolFinal = rol === 'admin' ? 'admin' : 'usuario'

    // Insertar el nuevo usuario en la base de datos
    // RETURNING devuelve los datos insertados
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol, created_at`,
      [nombre, email, password_hash, rolFinal]
    )

    // Obtener el usuario creado
    const usuario = rows[0]
    // Generar token JWT para el nuevo usuario
    const token = generarToken(usuario)

    // Devolver respuesta con código 201 (Created) y el token + datos del usuario
    res.status(201).json({ token, usuario })

  } catch (err) {
    // Pasar el error al middleware de manejo de errores
    next(err)
  }
}

// POST /api/auth/login - Iniciar sesión de usuario
const login = async (req, res, next) => {
  try {
    // Extraer email y password del cuerpo de la petición
    const { email, password } = req.body

    // Validar que ambos campos estén presentes
    if (!email || !password) {
      throw new AppError('email y password son obligatorios', 400)
    }

    // Buscar usuario en la base de datos por email
    // Solo busca usuarios activos (activo = true)
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email]
    )

    // Si no se encuentra el usuario, devolver error genérico
    // No especificamos si es email o contraseña por seguridad
    if (rows.length === 0) {
      throw new AppError('Credenciales incorrectas', 401)  // 401 Unauthorized
    }

    // Obtener el usuario encontrado
    const usuario = rows[0]
    // Verificar la contraseña usando bcrypt.compare
    // Esto extrae el salt del hash almacenado y lo usa para verificar
    const passwordValida = await bcrypt.compare(password, usuario.password_hash)

    // Si la contraseña no coincide, devolver error genérico
    if (!passwordValida) {
      throw new AppError('Credenciales incorrectas', 401)
    }

    // Generar token JWT para el usuario autenticado
    const token = generarToken(usuario)

    // Devolver respuesta con el token y datos del usuario (sin password)
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    })

  } catch (err) {
    // Pasar el error al middleware de manejo de errores
    next(err)
  }
}

// GET /api/auth/perfil - Obtener perfil del usuario autenticado
// Requiere middleware verificarToken antes
const perfil = async (req, res, next) => {
  try {
    // Buscar usuario en la base de datos usando el ID del token (req.usuario.id)
    // No devuelve el password_hash por seguridad
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )

    // Si no se encuentra el usuario, devolver error 404
    if (rows.length === 0) {
      throw new AppError('Usuario no encontrado', 404)
    }

    // Devolver los datos del usuario
    res.json(rows[0])
  } catch (err) {
    // Pasar el error al middleware de manejo de errores
    next(err)
  }
}

// Exportar las funciones del controlador para usarlas en el router
module.exports = { registro, login, perfil }
