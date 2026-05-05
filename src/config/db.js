// Importar Pool de pg para gestionar conexiones a PostgreSQL
const { Pool } = require('pg')
// Cargar variables de entorno desde archivo .env
require('dotenv').config()

// Configuración del pool de conexiones a PostgreSQL
// El pool permite reutilizar conexiones para mejorar rendimiento
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',           // Servidor de base de datos
  port: process.env.DB_PORT || 5432,                  // Puerto de PostgreSQL
  database: process.env.DB_NAME || 'peliculas_db',   // Nombre de la base de datos
  user: process.env.DB_USER || 'postgres',            // Usuario de PostgreSQL
  password: process.env.DB_PASSWORD || 'postgres',    // Contraseña del usuario
  max: 20,                                            // Máximo de conexiones simultáneas en el pool
  idleTimeoutMillis: 30000,                           // Tiempo (ms) antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000,                      // Tiempo (ms) de espera para establecer conexión
})

// Manejo de errores de conexión
// Si ocurre un error inesperado en el pool, se registra y se cierra el proceso
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err)
  process.exit(-1)
})

// Exportar el pool para usarlo en otros módulos
module.exports = pool
