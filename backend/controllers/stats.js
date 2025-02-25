// controllers/stats.js
const Stats = require('../models/stats');
const Usuario = require('../models/usuarios');

// POST /api/stats/start-level
// body: { userId, level }
const startLevel = async (req, res) => {
  try {
    const { userId, level } = req.body;
    const newSession = new Stats({ userId, level });
    await newSession.save();

    res.json({
      ok: true,
      msg: 'Sesión de nivel iniciada',
      statsId: newSession._id,
    });
  } catch (error) {
    console.error('Error al iniciar nivel:', error);
    res.status(500).json({ ok: false, msg: 'Error al iniciar nivel' });
  }
};
const endLevel = async (req, res) => {
    try {
      const { statsId } = req.params; // se envía como /api/stats/end-level/:statsId
      const session = await Stats.findById(statsId);
      if (!session) {
        return res.status(404).json({ ok: false, msg: 'Sesión no encontrada' });
      }
  
      // Marcamos la hora de finalización
      session.endTime = new Date();
      session.durationMs = session.endTime.getTime() - session.startTime.getTime();
  
      await session.save();
  
      res.json({
        ok: true,
        msg: 'Sesión de nivel finalizada',
        durationMs: session.durationMs,
      });
    } catch (error) {
      console.error('Error al finalizar nivel:', error);
      res.status(500).json({ ok: false, msg: 'Error al finalizar nivel' });
    }
};

  // GET /api/stats/tiempos-por-nivel
const tiemposPorNivel = async (req, res) => {
  try {
    const resultados = await Stats.aggregate([
      { 
        $match: { endTime: { $exists: true } } // Solo sesiones finalizadas
      },
      {
        $group: {
          _id: '$level',
          promedio: { $avg: '$durationMs' },
          minimo: { $min: '$durationMs' },
          maximo: { $max: '$durationMs' },
          totalSesiones: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 } // ordena por nivel asc
      }
    ]);
    res.json({ ok: true, data: resultados });
  } catch (error) {
    console.error('Error al calcular tiempos por nivel:', error);
    res.status(500).json({ ok: false, msg: 'Error al obtener estadísticas' });
  }
};

const getEstadisticasGenerales = async (req, res) => {
  console.log('[DEBUG] getEstadisticasGenerales llamado. Usuario:', req.uid || req.usuario);
  try {
    // 1) Distribución de usuarios por nivel
    const distribucion = await Usuario.aggregate([
      { $group: { _id: '$currentLevel', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('[DEBUG] Resultado de distribución:', distribucion);

    // 2) Tiempos de Stats por nivel (solo sesiones finalizadas)
    const tiempos = await Stats.aggregate([
      { $match: { endTime: { $exists: true } } },
      {
        $group: {
          _id: '$level',
          promedio: { $avg: '$durationMs' },
          minimo: { $min: '$durationMs' },
          maximo: { $max: '$durationMs' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    console.log('[DEBUG] Resultado de tiempos por nivel:', tiempos);

    res.json({
      ok: true,
      distribucionNiveles: distribucion.map(d => ({ level: d._id, count: d.count })),
      tiemposPorNivel: tiempos
    });
  } catch (error) {
    console.error('[ERROR] Error obteniendo estadísticas:', error);
    res.status(500).json({ ok: false, msg: 'Error interno' });
  }
};

  
  module.exports = {
    startLevel,
    endLevel,
    tiemposPorNivel,
    getEstadisticasGenerales
  };
