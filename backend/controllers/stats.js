// controllers/stats.js
const Stats = require('../models/stats');
const Usuario = require('../models/usuarios');
const mongoose = require('mongoose');

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

const startMode = async (req, res) => {
  try {
    const { userId, mode, level } = req.body;

    const newSession = new Stats({
      userId,
      mode,
      level: level || null, // si no lo pasas
      startTime: new Date(),
    });
    await newSession.save();

    return res.json({
      ok: true,
      msg: 'Sesión iniciada',
      statsId: newSession._id,
    });
  } catch (error) {
    console.error('Error al iniciar modo:', error);
    return res.status(500).json({ ok: false, msg: 'Error al iniciar modo' });
  }
};

// PATCH /api/stats/end-mode/:statsId
const endMode = async (req, res) => {
  try {
    const { statsId } = req.params;

    const session = await Stats.findById(statsId);
    if (!session) {
      return res.status(404).json({ ok: false, msg: 'Sesión no encontrada' });
    }

    // Cerramos la sesión
    session.endTime = new Date();
    session.durationMs =
      session.endTime.getTime() - session.startTime.getTime();

    await session.save();

    return res.json({
      ok: true,
      msg: 'Sesión finalizada',
      durationMs: session.durationMs,
    });
  } catch (error) {
    console.error('Error al finalizar modo:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno' });
  }
};

// GET /api/stats/tiempo-total-libre/:userId
const getTiempoTotalLibre = async (req, res) => {
  try {
    const { userId } = req.params;

    // Sumamos los durationMs de todos los Stats con mode = 'libre' para ese userId
    const agregados = await Stats.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          mode: 'libre',
          endTime: { $exists: true }, // solo sesiones ya cerradas
        },
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$durationMs' },
        },
      },
    ]);

    if (agregados.length === 0) {
      // no hay registros
      return res.json({
        ok: true,
        totalDurationMs: 0,
        msg: 'El usuario no tiene sesiones en modo libre finalizadas',
      });
    }

    const totalDurationMs = agregados[0].totalDuration;
    return res.json({
      ok: true,
      totalDurationMs,
    });
  } catch (error) {
    console.error('Error obteniendo el tiempo total en libre:', error);
    return res.status(500).json({ ok: false, msg: 'Error interno' });
  }
};

  
  module.exports = {
    startLevel,
    endLevel,
    tiemposPorNivel,
    getEstadisticasGenerales,
    getTiempoTotalLibre,
    endMode,
    startMode
  };
