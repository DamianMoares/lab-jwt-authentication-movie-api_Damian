# Resumen del Proyecto - API de Películas con Autenticación JWT

## 📋 Descripción General

Este proyecto es una API REST para gestionar películas con un sistema completo de autenticación y autorización usando JWT (JSON Web Tokens). La API permite a los usuarios registrarse, iniciar sesión y realizar operaciones CRUD sobre películas, con diferentes niveles de acceso según el rol del usuario.

## 🏗️ Arquitectura del Proyecto

```
lab-jwt-authentication-movie-api_Damian/
├── index.js                          # Punto de entrada del servidor Express
├── package.json                       # Dependencias del proyecto
├── .env                              # Variables de entorno (JWT_SECRET, DB config)
├── .gitignore                        # Archivos a ignorar por Git
├── database.sql                      # Script SQL para crear tablas
├── NOTAS.md                          # Reflexiones sobre seguridad JWT
├── RESUMEN.md                        # Este archivo - documentación completa
└── src/
    ├── config/
    │   └── db.js                     # Configuración de conexión a PostgreSQL
    ├── controllers/
    │   ├── authController.js         # Lógica de autenticación (registro, login, perfil)
    │   └── peliculasController.js    # Lógica de películas (CRUD + reseñas)
    ├── middleware/
    │   ├── verificarToken.js         # Middleware para validar JWT
    │   └── verificarRol.js           # Middleware para verificar roles de usuario
    ├── routes/
    │   ├── auth.js                   # Rutas de autenticación
    │   └── peliculas.js              # Rutas de películas con middlewares
    └── utils/
        └── AppError.js               # Clase personalizada para manejo de errores
```

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

1. **Registro** (`POST /api/auth/registro`)
   - Usuario envía: nombre, email, password, rol (opcional)
   - Sistema: hashea contraseña con bcrypt, crea usuario en BD
   - Respuesta: token JWT + datos del usuario

2. **Login** (`POST /api/auth/login`)
   - Usuario envía: email, password
   - Sistema: verifica credenciales con bcrypt.compare
   - Respuesta: token JWT + datos del usuario

3. **Uso del Token**
   - Cliente incluye token en header: `Authorization: Bearer <token>`
   - Middleware `verificarToken` valida el token
   - Middleware `verificarRol` verifica permisos según rol

### Roles de Usuario

- **usuario**: Puede leer películas públicas y crear películas/reseñas
- **admin**: Tiene todos los permisos + puede actualizar/eliminar películas

## 📊 Base de Datos

### Tablas

#### `usuarios`
- `id`: Identificador único (auto-incremental)
- `nombre`: Nombre completo del usuario
- `email`: Email único (índice para búsquedas rápidas)
- `password_hash`: Contraseña hasheada con bcrypt
- `rol`: 'usuario' o 'admin' (con restricción CHECK)
- `activo`: Booleano para desactivar usuarios
- `created_at`: Timestamp de creación

#### `peliculas`
- `id`: Identificador único
- `titulo`: Título de la película
- `anio`: Año de estreno
- `nota`: Puntuación (decimal)
- `director`: Nombre del director
- `genero`: Género cinematográfico
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de última actualización

#### `resenas`
- `id`: Identificador único
- `pelicula_id`: FK a peliculas (CASCADE DELETE)
- `usuario_id`: FK a usuarios (CASCADE DELETE)
- `texto`: Contenido de la reseña
- `puntuacion`: Puntuación 1-5 (con restricción CHECK)
- `created_at`: Timestamp de creación

## 🛣️ Endpoints de la API

### Autenticación

| Método | Endpoint | Descripción | Requiere Token |
|--------|----------|-------------|----------------|
| POST | `/api/auth/registro` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/perfil` | Obtener perfil del usuario | Sí |

### Películas

| Método | Endpoint | Descripción | Requiere Token | Rol |
|--------|----------|-------------|----------------|-----|
| GET | `/api/peliculas` | Listar todas las películas | No | - |
| GET | `/api/peliculas/:id` | Obtener película por ID | No | - |
| POST | `/api/peliculas` | Crear nueva película | Sí | Cualquiera |
| PUT | `/api/peliculas/:id` | Actualizar película | Sí | Admin |
| DELETE | `/api/peliculas/:id` | Eliminar película | Sí | Admin |
| GET | `/api/peliculas/:id/resenas` | Listar reseñas de película | No | - |
| POST | `/api/peliculas/:id/resenas` | Crear reseña | Sí | Cualquiera |

## 🔧 Componentes del Sistema

### 1. Configuración de Base de Datos (`src/config/db.js`)
- Crea un pool de conexiones a PostgreSQL
- Configura parámetros de conexión desde variables de entorno
- Maneja errores de conexión automáticamente
- Optimiza con límite de conexiones y timeouts

### 2. Manejo de Errores (`src/utils/AppError.js`)
- Clase personalizada que extiende Error
- Incluye statusCode y status (error/fail)
- Marca errores como operacionales para distinguir de errores del sistema
- Captura stack trace para depuración

### 3. Controlador de Autenticación (`src/controllers/authController.js`)
- **registro**: Valida datos, verifica email duplicado, hashea contraseña, crea usuario, genera token
- **login**: Busca usuario, verifica contraseña con bcrypt, genera token
- **perfil**: Obtiene datos del usuario desde el token
- Usa bcrypt con SALT_ROUNDS=10 para hashear contraseñas

### 4. Middleware verificarToken (`src/middleware/verificarToken.js`)
- Extrae token del header `Authorization: Bearer <token>`
- Verifica firma con JWT_SECRET
- Maneja tokens expirados (TokenExpiredError)
- Decodifica payload y lo guarda en `req.usuario`
- Pasa al siguiente middleware si válido, o devuelve 401

### 5. Middleware verificarRol (`src/middleware/verificarRol.js`)
- Factory function que acepta roles permitidos
- Verifica que `req.usuario` existe (usuario autenticado)
- Comprueba si el rol del usuario está en los permitidos
- Devuelve 403 si no tiene permisos

### 6. Controlador de Películas (`src/controllers/peliculasController.js`)
- **listarPeliculas**: SELECT * FROM peliculas (público)
- **obtenerPelicula**: SELECT WHERE id = $1 (público)
- **crearPelicula**: INSERT con validación (requiere token)
- **actualizarPelicula**: UPDATE con COALESCE para actualización parcial (solo admin)
- **eliminarPelicula**: DELETE (solo admin)
- **listarResenas**: SELECT FROM resenas WHERE pelicula_id (público)
- **crearResena**: INSERT con usuario_id del token (requiere token)

### 7. Router de Autenticación (`src/routes/auth.js`)
- Define rutas para registro, login y perfil
- Aplica middleware verificarToken solo a perfil
- Exporta router para montar en index.js

### 8. Router de Películas (`src/routes/peliculas.js`)
- Rutas públicas: GET todas las operaciones de lectura
- Rutas protegidas: POST crear película y reseña (cualquier usuario)
- Rutas admin: PUT y DELETE (solo admin)
- Aplica middlewares verificarToken y verificarRol según necesidad

### 9. Servidor Principal (`index.js`)
- Inicializa aplicación Express
- Configura middleware para parsear JSON
- Monta routers en sus respectivos paths
- Manejo global de errores con try-catch
- Inicia servidor en puerto configurado

## 🔒 Seguridad Implementada

### Contraseñas
- **Hasheo**: bcrypt con 10 rounds de salt
- **No almacenamiento en texto plano**: Siempre password_hash
- **Verificación**: bcrypt.compare (timing-attack resistant)

### JWT (JSON Web Tokens)
- **Firma**: HMAC con SHA256 usando JWT_SECRET
- **Payload**: id, email, rol (sin datos sensibles)
- **Expiración**: 24h (configurable en .env)
- **Validación**: Verifica firma y expiración en cada petición

### Autorización
- **Middleware verificarToken**: Requiere token para rutas protegidas
- **Middleware verificarRol**: Verifica permisos específicos
- **Rutas públicas**: Lectura de películas y reseñas sin autenticación
- **Rutas protegidas**: Escritura requiere autenticación
- **Rutas admin**: Operaciones destructivas requieren rol admin

### Mensajes de Error
- **Login genérico**: "Credenciales incorrectas" (evita enumeración)
- **No revela existencia de usuarios**: No indica si email existe
- **Errores 401/403 claros**: Distingue entre no autenticado y no autorizado

## 🚀 Cómo Ejecutar el Proyecto

### 1. Configurar Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE peliculas_db;

# Ejecutar script SQL
\i database.sql
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
El archivo `.env` ya está configurado con:
```
JWT_SECRET=mi-secreto-jwt-muy-largo-2024
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_PORT=5432
DB_NAME=peliculas_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
```

### 4. Iniciar Servidor
```bash
npm start
```

### 5. Probar la API
```bash
# Registrar usuario admin
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Admin", "email": "admin@test.com", "password": "admin123", "rol": "admin"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "admin123"}'

# Usar el token para crear película
curl -X POST http://localhost:3000/api/peliculas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"titulo": "Dune", "anio": 2021, "director": "Denis Villeneuve", "genero": "ciencia-ficcion"}'
```

## 📝 Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express**: Framework web para API REST
- **PostgreSQL**: Base de datos relacional
- **pg**: Cliente de PostgreSQL para Node.js
- **bcrypt**: Librería para hashear contraseñas
- **jsonwebtoken**: Librería para generar y verificar JWT
- **dotenv**: Carga variables de entorno desde .env

## ✅ Criterios de Evaluación Cumplidos

- [x] `POST /api/auth/registro` crea el usuario y devuelve un token JWT
- [x] `POST /api/auth/registro` con email duplicado devuelve 409
- [x] `POST /api/auth/login` con credenciales correctas devuelve token
- [x] `POST /api/auth/login` con contraseña incorrecta devuelve 401
- [x] `GET /api/peliculas` funciona sin token (pública)
- [x] `POST /api/peliculas` sin token devuelve 401
- [x] `POST /api/peliculas` con token válido crea la película (201)
- [x] `DELETE /api/peliculas/:id` con token de usuario normal devuelve 403
- [x] `DELETE /api/peliculas/:id` con token de admin funciona correctamente
- [x] Las contraseñas NO se guardan en texto plano en la base de datos

## 🎯 Próximos Pasos (Bonus)

1. **Refresh Tokens**: Implementar tokens de refresco para sesiones largas
2. **Blacklist de Tokens**: Sistema de logout invalidando tokens
3. **Middleware de Auditoría**: Registrar accesos a rutas protegidas
4. **Rate Limiting**: Limitar peticiones por IP para prevenir ataques
5. **Validación con Joi/Zod**: Validación más robusta de datos de entrada
