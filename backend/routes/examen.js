// routes/examen.js
const { Router } = require('express');
const { generarPregunta, verificarRespuesta } = require('../controllers/examen');
const { validarJWT } = require('../middleware/validar-jwt');

const router = Router();

// GET: Generar la pregunta (requiere que el usuario esté logueado)
router.get('/generar', validarJWT, generarPregunta);

// POST: Verificar la respuesta (también requiere que el usuario esté logueado)
router.post('/verificar', validarJWT, verificarRespuesta);

module.exports = router;
