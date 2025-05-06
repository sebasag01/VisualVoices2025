// routes/examen.js
const { Router } = require('express');
const { startSession, generarPregunta, verificarRespuesta, listSessions  } = require('../controllers/examen');
const { validarJWT } = require('../middleware/validar-jwt');
const { tieneRol }   = require('../middleware/validar-rol'); 

const router = Router();

// GET: Generar la pregunta (requiere que el usuario esté logueado)
router.get('/generar', validarJWT, generarPregunta);

// POST: Verificar la respuesta (también requiere que el usuario esté logueado)
router.post('/verificar', validarJWT, verificarRespuesta);

router.post('/start-session', validarJWT, startSession);

router.get('/sessions', [validarJWT, tieneRol('ROL_ADMIN')], listSessions);

module.exports = router;
