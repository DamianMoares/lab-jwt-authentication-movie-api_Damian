# Notas de Reflexión - Autenticación JWT

## 1. ¿Por qué es importante que el mensaje de error del login sea genérico?

Es importante usar un mensaje genérico como "Credenciales incorrectas" en lugar de especificar si fue el email o la contraseña lo que falló por razones de seguridad:

- **Evita ataques de enumeración de usuarios**: Si el mensaje indica "Email no encontrado", un atacante podría probar múltiples emails para descubrir cuáles están registrados en el sistema.
- **Protege la privacidad de los usuarios**: No revela información sobre qué usuarios existen en la base de datos.
- **Previene ataques de fuerza bruta dirigidos**: Un atacante no puede saber si debe enfocarse en probar contraseñas para un email existente o si debe probar diferentes emails.
- **Mejor práctica de seguridad**: Según OWASP, los mensajes de autenticación deben ser vagos para no filtrar información útil a posibles atacantes.

## 2. ¿Qué información NO deberías guardar nunca en el payload del JWT?

Nunca deberías guardar información sensible en el payload del JWT porque:

- **El JWT no está encriptado, solo firmado**: Cualquier persona que tenga el token puede decodificarlo y leer su contenido (base64).
- **Información sensible a no incluir**:
  - Contraseñas (obviamente)
  - Datos financieros (números de tarjeta, cuentas bancarias)
  - Información personal confidencial (direcciones, teléfonos, documentos de identidad)
  - Tokens de sesión de otros servicios
  - Claves API o secretos
  - Información médica o de salud

- **Solo incluir información no sensible**: El payload debe contener solo datos necesarios para la identificación y autorización del usuario, como:
  - ID del usuario
  - Email
  - Rol/permisos
  - Fecha de expiración

## 3. ¿Por qué usamos `bcrypt.compare` en lugar de hashear la contraseña y compararla con `===`?

Usamos `bcrypt.compare` en lugar de hashear y comparar directamente por varias razones importantes:

- **Salting automático**: bcrypt genera un "salt" aleatorio único para cada contraseña. Este salt se incluye en el hash final. Si hasheamos la misma contraseña dos veces, obtendremos hashes diferentes debido a salts diferentes.

- **Extracción del salt**: `bcrypt.compare` extrae automáticamente el salt del hash almacenado y lo usa para hashear la contraseña proporcionada antes de comparar. Si hiciéramos `bcrypt.hash(password)` y luego `===`, nunca coincidirían porque el salt sería diferente.

- **Factor de trabajo (cost)**: bcrypt tiene un factor de cost que hace que el hasheado sea computacionalmente costoso (intencionalmente lento) para dificultar ataques de fuerza bruta. `bcrypt.compare` maneja esto correctamente.

- **Implementación correcta**: La forma correcta de verificar contraseñas con bcrypt es siempre usar `bcrypt.compare(plainPassword, hashedPassword)`, que internamente:
  1. Extrae el salt del hash almacenado
  2. Aplica el mismo factor de cost
  3. Hashea la contraseña proporcionada
  4. Compara los hashes de forma segura (timing-attack resistant)
