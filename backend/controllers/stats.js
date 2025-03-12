// controllers/stats.js
const Stats = require('../models/stats');
const Usuario = require('../models/usuarios');
const mongoose = require('mongoose');

// POST /api/stats/start-level
// body: { userId, level }
// La función 'startLevel' inicia una sesión de nivel para un usuario.
// 1. Extrae 'userId' y 'level' del cuerpo de la petición (req.body).
// 2. Crea un nuevo documento Stats con estos datos.
// 3. Guarda la sesión y devuelve el ID de la misma.
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

// La función 'endLevel' finaliza una sesión de nivel existente.
// 1. Recibe el 'statsId' en los parámetros de la URL.
// 2. Busca la sesión correspondiente en la base de datos. 
// 3. Registra la hora de finalización y calcula la duración en milisegundos.
// 4. Devuelve la duración de la sesión.
const endLevel = async (req, res) => {
  try {
    const { statsId } = req.params; 
    const session = await Stats.findById(statsId);
    if (!session) {
      return res.status(404).json({ ok: false, msg: 'Sesión no encontrada' });
    }

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

// La función 'tiemposPorNivel' calcula estadísticas de tiempo por nivel basadas en sesiones finalizadas.
// 1. Filtra documentos Stats con 'endTime' definido (sesiones cerradas).
// 2. Agrupa por 'level' calculando promedio, mínimo, máximo y total de sesiones.
// 3. Ordena los resultados por nivel y los devuelve.
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
        $sort: { _id: 1 } 
      }
    ]);
    res.json({ ok: true, data: resultados });
  } catch (error) {
    console.error('Error al calcular tiempos por nivel:', error);
    res.status(500).json({ ok: false, msg: 'Error al obtener estadísticas' });
  }
};

// La función 'getEstadisticasGenerales' obtiene:
// 1) Distribución de usuarios por nivel (a partir de la colección 'Usuario').
// 2) Tiempos por nivel (desde la colección 'Stats') para sesiones finalizadas.
// 3) Devuelve ambos conjuntos de datos al cliente.
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

// La función 'startMode' inicia una sesión Stats para un 'mode' específico.
// 1. Recibe 'userId', 'mode' y opcionalmente 'level' desde el cuerpo.
// 2. Crea el documento en la base de datos, con la fecha de inicio.
// 3. Devuelve el id de la sesión creada.
const startMode = async (req, res) => {
  try {
    const { userId, mode, level } = req.body;

    const newSession = new Stats({
      userId,
      mode,
      level: level || null, 
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

// La función 'endMode' cierra la sesión de un modo específico (p.e. modo libre).
// 1. Recibe el 'statsId' en los parámetros de la ruta.
// 2. Busca la sesión y registra la hora de finalización, calculando la duración total.
// 3. Guarda los cambios y devuelve la duración de la sesión.
const endMode = async (req, res) => {
  try {
    const { statsId } = req.params;

    const session = await Stats.findById(statsId);
    if (!session) {
      return res.status(404).json({ ok: false, msg: 'Sesión no encontrada' });
    }

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

// La función 'getTiempoTotalLibre' calcula la duración total en modo 'libre' para un usuario.
// 1. Toma el 'userId' de los parámetros.
// 2. Suma los 'durationMs' de todas las sesiones finalizadas (endTime definido) con mode = 'libre'.
// 3. Devuelve la suma (o 0 si no hay sesiones) en milisegundos.
const getTiempoTotalLibre = async (req, res) => {
  try {
    const { userId } = req.params;

    const agregados = await Stats.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          mode: 'libre',
          endTime: { $exists: true },
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

