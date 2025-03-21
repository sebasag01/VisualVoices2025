/*
    Ruta base: /api/categorias
*/

const { Router } = require('express');
const {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    editarCategoria,
    eliminarCategoria,
} = require('../controllers/categorias');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { tieneRol } = require('../middleware/validar-rol');

const router = Router();

router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoria);

router.post('/', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden crear categorías
    validarCampos,
], crearCategoria);

router.put('/:id', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden editar categorías
    validarCampos,
], editarCategoria);

router.delete('/:id', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden eliminar categorías
], eliminarCategoria);

module.exports = router;

// Este archivo define las rutas de autenticación y registro de usuarios, así como la obtención de datos
// del usuario autenticado. Incluye validaciones de campos y límites de solicitudes para el login.
//
// 1. Se importan los módulos y funciones necesarias: Router de express, controladores (login, logout, crearUsuario),
//    validaciones (check, validarCampos, validarJWT) y el modelo Usuario, entre otros.
//
// 2. Se configura el router, que gestionará las rutas de la aplicación relacionadas con la autenticación y el registro.
//
// 3. Ruta GET '/usuario':
//    - Utiliza el middleware 'validarJWT' para verificar el token.
//    - Recupera el usuario a partir del uid (campo asignado durante la verificación del token).
//    - Si no se encuentra usuario, devuelve un error 404.
//    - Retorna los datos relevantes del usuario como respuesta exitosa.
//
// 4. Se crea un limitador 'loginLimiter' con 'express-rate-limit':
//    - Limita el número de solicitudes de login que pueden realizarse en un intervalo (windowMs = 1 minuto).
//    - 'max: 5' establece que se permiten 5 intentos por IP cada 60 segundos.
//    - Si se excede el límite, responde con un estado 429 indicando cuántos segundos esperar antes de reintentar.
//
// 5. Ruta POST '/' (login):
//    - Aplica el 'loginLimiter' para controlar la frecuencia de intentos de login.
//    - Verifica con 'check' que el campo 'password' no esté vacío y que el 'email' sea válido.
//    - 'validarCampos' revisa si hay errores de validación y, de haberlos, envía una respuesta 400.
//    - Llama al controlador 'login' para procesar la solicitud.
//
// 6. Ruta POST '/register':
//    - Realiza validaciones sobre el email y el password (por ejemplo, que el email sea válido, que el password tenga
//      la longitud apropiada, contenga mayúsculas, minúsculas, dígitos y caracteres especiales).
//    - De existir errores, se devuelven con un estado 400.
//    - Si no hay errores, se llama al controlador 'crearUsuario' para registrar un nuevo usuario.
//
// 7. Ruta POST '/logout':
//    - Llama al controlador 'logout' que limpia la cookie y finaliza la sesión del usuario.
//
// 8. Finalmente, se exporta el router para que sea utilizado en la configuración principal de la aplicación.
