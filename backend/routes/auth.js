const { Router } = require('express');
const { login,logout } = require('../controllers/auth');
const { crearUsuario } = require('../controllers/usuarios');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const Usuario = require('../models/usuarios');

const router = Router();


router.get('/usuario', validarJWT, async (req, res) => {
    console.log('[DEBUG] Verificación de usuario con uid:', req.uid);
  
    try {
      const usuario = await Usuario.findById(req.uid, 'nombre rol currentLevel currentWordIndex');
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
          currentWordIndex: usuario.currentWordIndex
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
  

router.post('/', [
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], login);

router.post('/register', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
], crearUsuario);

router.post('/logout', logout);


module.exports = router;