// Importar pool de conexiones a PostgreSQL
const pool = require('../config/db')
// Importar clase personalizada de errores
const AppError = require('../utils/AppError')

// GET /api/peliculas - Listar todas las películas (público, no requiere autenticación)
const listarPeliculas = async (req, res, next) => {
  try {
    // Consultar todas las películas ordenadas por fecha de creación (más recientes primero)
    const { rows } = await pool.query(
      'SELECT * FROM peliculas ORDER BY created_at DESC'
    )
    // Devolver array de películas
    res.json(rows)
  } catch (err) {
    // Pasar error al middleware de manejo de errores
    next(err)
  }
}

// GET /api/peliculas/:id - Obtener una película por ID (público, no requiere autenticación)
const obtenerPelicula = async (req, res, next) => {
  try {
    // Extraer ID de los parámetros de la URL
    const { id } = req.params
    // Buscar película por ID
    const { rows } = await pool.query(
      'SELECT * FROM peliculas WHERE id = $1',
      [id]
    )

    // Si no se encuentra la película, devolver error 404
    if (rows.length === 0) {
      throw new AppError('Película no encontrada', 404)
    }

    // Devolver la película encontrada
    res.json(rows[0])
  } catch (err) {
    // Pasar error al middleware de manejo de errores
    next(err)
  }
}

// POST /api/peliculas - Crear una nueva película (protegido, requiere token de cualquier usuario)
const crearPelicula = async (req, res, next) => {
  try {
    // Extraer datos del cuerpo de la petición
    const { titulo, anio, nota, director, genero } = req.body

    // Validar campos obligatorios
    if (!titulo || !anio) {
      throw new AppError('titulo y anio son obligatorios', 400)
    }

    // Insertar nueva película en la base de datos
    // RETURNING * devuelve la película creada
    const { rows } = await pool.query(
      `INSERT INTO peliculas (titulo, anio, nota, director, genero)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [titulo, anio, nota, director, genero]
    )

    // Devolver respuesta con código 201 (Created) y la película creada
    res.status(201).json(rows[0])
  } catch (err) {
    // Pasar error al middleware de manejo de errores
    next(err)
  }
}

// PUT /api/peliculas/:id - Actualizar una película (protegido, solo admin)
const actualizarPelicula = async (req, res, next) => {
  try {
    // Extraer ID de los parámetros de la URL
    const { id } = req.params
    // Extraer datos a actualizar del cuerpo de la petición
    const { titulo, anio, nota, director, genero } = req.body

    // Actualizar película usando COALESCE para actualización parcial
    // COALESCE devuelve el primer valor no NULL, permitiendo actualizar solo campos enviados
    const { rows } = await pool.query(
      `UPDATE peliculas
       SET titulo = COALESCE($1, titulo),
           anio = COALESCE($2, anio),
           nota = COALESCE($3, nota),
           director = COALESCE($4, director),
           genero = COALESCE($5, genero)
       WHERE id = $6
       RETURNING *`,
      [titulo, anio, nota, director, genero, id]
    )

    // Si no se encuentra la película, devolver error 404
    if (rows.length === 0) {
      throw new AppError('Película no encontrada', 404)
    }

    // Devolver la película actualizada
    res.json(rows[0])
  } catch (err) {
    // Pasar error al middleware de manejo de errores
    next(err)
  }
}

// DELETE /api/peliculas/:id - Eliminar una película (protegido, solo admin)
const eliminarPelicula = async (req, res, next) => {
  try {
    // Extraer ID de los parámetros de la URL
    const { id } = req.params

    // Eliminar película por ID
    // RETURNING * devuelve la película eliminada antes de borrarla
    const { rows } = await pool.query(
      'DELETE FROM peliculas WHERE id = $1 RETURNING *',
      [id]
    )

    // Si no se encuentra la película, devolver error 404
    if (rows.length === 0) {
      throw new AppError('Película no encontrada', 404)
    }

    // Devolver mensaje de confirmación
    res.json({ mensaje: 'Película eliminada correctamente' })
  } catch (err) {
    // Pasar error al middleware de manejo de errores
    next(err)
  }
}

// GET /api/peliculas/:id/resenas - Listar reseñas de una película (público, no requiere autenticación)
const listarResenas = async (req, res, next) => {
  try {
    // Extraer ID de la película de los parámetros de la URL
    const { id } = req.params
    // Consultar todas las reseñas de esa película ordenadas por fecha
    const { rows } = await pool.query(
      'SELECT * FROM resenas WHERE pelicula_id = $1 ORDER BY created_at DESC',
      [id]
    )
    // Devolver array de reseñas
    res.json(rows)
  } catch (err) {
    // Pasar error al middleware de manejo de errores
    next(err)
  }
}

// POST /api/peliculas/:id/resenas - Crear una reseña (protegido, requiere token de cualquier usuario)
const crearResena = async (req, res, next) => {
  try {
    // Extraer ID de la película de los parámetros de la URL
    const { id } = req.params
    // Extraer datos de la reseña del cuerpo de la petición
    const { texto, puntuacion } = req.body

    // Validar campos obligatorios
    if (!texto || !puntuacion) {
      throw new AppError('texto y puntuacion son obligatorios', 400)
    }

    // Validar rango de puntuación (1-5)
    if (puntuacion < 1 || puntuacion > 5) {
      throw new AppError('La puntuación debe estar entre 1 y 5', 400)
    }

    // Insertar nueva reseña en la base de datos
    // usuario_id se obtiene del token (req.usuario.id)
    const { rows } = await pool.query(
      `INSERT INTO resenas (pelicula_id, usuario_id, texto, puntuacion)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, req.usuario.id, texto, puntuacion]
    )

    // Devolver respuesta con código 201 (Created) y la reseña creada
    res.status(201).json(rows[0])
  } catch (err) {
    // Pasar error al middleware de manejo de errores
    next(err)
  }
}

// Exportar todas las funciones del controlador para usarlas en el router
module.exports = {
  listarPeliculas,
  obtenerPelicula,
  crearPelicula,
  actualizarPelicula,
  eliminarPelicula,
  listarResenas,
  crearResena
}
