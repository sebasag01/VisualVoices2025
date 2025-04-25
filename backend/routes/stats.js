const { Router } = require('express');
const { startLevel, endLevel, tiemposPorNivel, getEstadisticasGenerales,getTiempoTotalLibre, endMode, startMode, getSesionesDiarias, getProporcionUsuarios,getHorasPico, getExamStats,getScoreDistribution,getTopFailedWords,getPerformanceEvolution  } = require('../controllers/stats');
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
router.get('/sesiones-diarias',validarJWT, getSesionesDiarias);

router.get('/proporcion-usuarios', [
  validarJWT,
  tieneRol('ROL_ADMIN'),
], getProporcionUsuarios);

router.get('/horas-pico', [
  validarJWT,
  tieneRol('ROL_ADMIN'),
], getHorasPico);

router.get('/examen-stats', [validarJWT, tieneRol('ROL_ADMIN')], getExamStats);

router.get(
  '/scores-distribution',
  [ validarJWT, tieneRol('ROL_ADMIN') ],
  getScoreDistribution
);

router.get(
  '/top-failed-words',
  [ validarJWT, tieneRol('ROL_ADMIN') ],
  getTopFailedWords
);


router.get(
  '/performance-evolution',
  [ validarJWT, tieneRol('ROL_ADMIN') ],
  getPerformanceEvolution
);

module.exports = router;

// Este archivo define las rutas relacionadas con la gestión de estadísticas de la aplicación.
// 1. Se importan los métodos del controlador 'stats': startLevel, endLevel, tiemposPorNivel, etc.
// 2. Se utilizan los middlewares 'validarJWT' y 'tieneRol' para proteger ciertas rutas.

// Rutas definidas:
// 1. POST '/start-level': Inicia una sesión de nivel.
// 2. PATCH '/end-level/:statsId': Finaliza la sesión de nivel identificada por 'statsId'.
// 3. GET '/tiempos-por-nivel': Obtiene estadísticas de tiempos promediados, mínimos, máximos, etc. por nivel.
// 4. POST '/start-mode': Inicia una sesión en un modo específico (libre, guiado, examen), protegido por 'validarJWT'.
// 5. PATCH '/end-mode/:statsId': Finaliza la sesión de modo identificada por 'statsId', también protegido por 'validarJWT'.
// 6. GET '/estadisticas': Devuelve las estadísticas generales de la aplicación (distribución de usuarios por nivel
//    y tiempos por nivel), protegido por 'validarJWT' y 'tieneRol("ROL_ADMIN")'.
// 7. GET '/libre-total/:userId': Obtiene la suma de duración total en modo libre para el usuario especificado, 
//    protegido por 'validarJWT'.
