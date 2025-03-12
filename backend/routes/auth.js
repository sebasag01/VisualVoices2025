const { Router } = require('express');
const { login,logout } = require('../controllers/auth');
const { crearUsuario } = require('../controllers/usuarios');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');

const rateLimit = require("express-rate-limit");

const Usuario = require('../models/usuarios');

const router = Router();


router.get('/usuario', validarJWT, async (req, res) => {
    console.log('[DEBUG] Verificación de usuario con uid:', req.uid);
  
    try {
      const usuario = await Usuario.findById(req.uid, 'nombre rol currentLevel currentWordIndex exploredFreeWords lastWordLearned isnewuser');
      if (!usuario) {
        console.log('[ERROR] Usuario no encontrado para uid:', req.uid);
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado',
        });
      }
  
      console.log('[DEBUG] Usuario encontrado:', usuario);
  
      res.json({
        ok: true,
        usuario: {
          uid: usuario._id,
          nombre: usuario.nombre,
          rol: usuario.rol,
          currentLevel: usuario.currentLevel,
          currentWordIndex: usuario.currentWordIndex,
          exploredFreeWords: usuario.exploredFreeWords,
          lastWordLearned: usuario.lastWordLearned,
          isnewuser: usuario.isnewuser
        },
      });
    } catch (error) {
      console.error('[ERROR] Error al obtener el usuario:', error);
      res.status(500).json({
        ok: false,
        msg: 'Error al obtener el usuario',
      });
    }
  });
  
  const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5, // máximo 5 solicitudes por IP en 1 minuto
    statusCode: 429,
    handler: function (req, res, next, options) {
      // Calcula el tiempo restante en segundos
      const retrySecs = Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000);
      res.status(options.statusCode).json({
        error: `Vuelve a intentarlo en ${retrySecs} segundos.`
      });
    }
  });

router.post('/', loginLimiter, [
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty().isEmail().normalizeEmail(),
    validarCampos,
], login);

router.post('/register', [
  //check('nombre', 'El argumento nombre es obligatorio').not().isEmpty().trim().escape(),
  //check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty().trim().escape(),
  check('email', 'El argumento email es obligatorio').not().isEmpty().isEmail().withMessage('El formato del correo no es válido.').normalizeEmail(),  
  check('password')
  .not().isEmpty().withMessage('El argumento password es obligatorio')
  .isLength({ min: 8, max: 12 }).withMessage('La contraseña debe tener entre 8 y 12 caracteres.')
  .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula.')
  .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula.')
  .matches(/\d/).withMessage('La contraseña debe contener al menos un número.')
  .matches(/[!@#$%^&*()]/).withMessage('La contraseña debe contener al menos un carácter especial.'),
  validarCampos,
], crearUsuario);

router.post('/logout', logout);


module.exports = router;

// Este archivo define las rutas de autenticación y registro de usuarios, así como la obtención de datos
// del usuario autenticado. Incluye validaciones de campos y límites de solicitudes para el login.

// 1. Se importan los módulos y funciones necesarias: Router de express, controladores (login, logout, crearUsuario),
//    validaciones (check, validarCampos, validarJWT) y el modelo Usuario, entre otros.

// 2. Se configura el router, que gestionará las rutas de la aplicación relacionadas con la autenticación y el registro.

// 3. Ruta GET '/usuario':
//    - Utiliza el middleware 'validarJWT' para verificar el token.
//    - Recupera el usuario a partir del uid (campo asignado durante la verificación del token).
//    - Si no se encuentra usuario, devuelve un error 404.
//    - Retorna los datos relevantes del usuario como respuesta exitosa.

// 4. Se crea un limitador 'loginLimiter' con 'express-rate-limit':
//    - Limita el número de solicitudes de login que pueden realizarse en un intervalo (windowMs = 1 minuto).
//    - 'max: 5' establece que se permiten 5 intentos por IP cada 60 segundos.
//    - Si se excede el límite, responde con un estado 429 indicando cuántos segundos esperar antes de reintentar.

// 5. Ruta POST '/' (login):
//    - Aplica el 'loginLimiter' para controlar la frecuencia de intentos de login.
//    - Verifica con 'check' que el campo 'password' no esté vacío y que el 'email' sea válido.
//    - 'validarCampos' revisa si hay errores de validación y, de haberlos, envía una respuesta 400.
//    - Llama al controlador 'login' para procesar la solicitud.

// 6. Ruta POST '/register':
//    - Realiza validaciones sobre el email y el password (por ejemplo, que el email sea válido, que el password tenga
//      la longitud apropiada, contenga mayúsculas, minúsculas, dígitos y caracteres especiales).
//    - De existir errores, se devuelven con un estado 400.
//    - Si no hay errores, se llama al controlador 'crearUsuario' para registrar un nuevo usuario.

// 7. Ruta POST '/logout':
//    - Llama al controlador 'logout' que limpia la cookie y finaliza la sesión del usuario.

// 8. Finalmente, se exporta el router para que sea utilizado en la configuración principal de la aplicación.
