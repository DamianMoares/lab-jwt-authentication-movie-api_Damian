const { Pool } = require('pg')
require('dotenv').config()

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'peliculas_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo antes de cerrar clientes inactivos
  connectionTimeoutMillis: 2000, // Tiempo de espera para conexión
})

// Manejo de errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente de PostgreSQL', err)
  process.exit(-1)
})

module.exports = pool
