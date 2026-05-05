-- Conectar a la base de datos
-- \c peliculas_db

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol           VARCHAR(20) NOT NULL DEFAULT 'usuario'
                CHECK (rol IN ('usuario', 'admin')),
  activo        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de películas
CREATE TABLE IF NOT EXISTS peliculas (
  id          SERIAL PRIMARY KEY,
  titulo      VARCHAR(255) NOT NULL,
  anio        INTEGER NOT NULL,
  nota        DECIMAL(3,1),
  director    VARCHAR(255),
  genero      VARCHAR(100),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS resenas (
  id          SERIAL PRIMARY KEY,
  pelicula_id INTEGER NOT NULL REFERENCES peliculas(id) ON DELETE CASCADE,
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  texto       TEXT NOT NULL,
  puntuacion  INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_peliculas_titulo ON peliculas(titulo);
CREATE INDEX IF NOT EXISTS idx_resenas_pelicula ON resenas(pelicula_id);
CREATE INDEX IF NOT EXISTS idx_resenas_usuario ON resenas(usuario_id);

-- Insertar datos de prueba (opcional)
-- INSERT INTO peliculas (titulo, anio, nota, director, genero) VALUES
--   ('Dune', 2021, 8.0, 'Denis Villeneuve', 'ciencia-ficcion'),
--   ('El Padrino', 1972, 9.2, 'Francis Ford Coppola', 'drama'),
--   ('Matrix', 1999, 8.7, 'Lana Wachowski, Lilly Wachowski', 'ciencia-ficcion');

SELECT 'Tablas creadas exitosamente' AS resultado;
