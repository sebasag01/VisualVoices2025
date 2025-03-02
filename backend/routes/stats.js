const { Router } = require('express');
const { startLevel, endLevel, tiemposPorNivel, getEstadisticasGenerales,getTiempoTotalLibre, endMode, startMode } = require('../controllers/stats');
const { validarJWT } = require('../middleware/validar-jwt');
const { tieneRol } = require('../middleware/validar-rol');

const router = Router();

router.post('/start-level', startLevel);
router.patch('/end-level/:statsId', endLevel);
router.get('/tiempos-por-nivel', tiemposPorNivel);

router.post('/start-mode', validarJWT, startMode);
router.patch('/end-mode/:statsId', validarJWT, endMode);

// Protegemos la ruta de estadísticas
router.get('/estadisticas', [
  validarJWT,
  tieneRol('ROL_ADMIN'),
], getEstadisticasGenerales);

router.get('/libre-total/:userId', validarJWT, getTiempoTotalLibre);


module.exports = router;
