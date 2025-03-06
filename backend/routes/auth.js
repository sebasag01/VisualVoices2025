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
      const usuario = await Usuario.findById(req.uid, 'nombre rol currentLevel currentWordIndex exploredFreeWords');
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
          exploredFreeWords: usuario.exploredFreeWords
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