// controllers/stats.js
const Stats = require('../models/stats');
const Usuario = require('../models/usuarios');
const mongoose = require('mongoose');
const ExamenSession = require('../models/examenSession');
const Palabra = require('../models/palabras');
const CategoryEntry = require('../models/categoryEntry');
const Categoria = require('../models/categorias');
const WordEntry = require('../models/wordnEntry');
const CategorySession = require('../models/categorySession');


// POST /api/stats/start-level
// body: { userId, level }
// La función 'startLevel' inicia una sesión de nivel para un usuario.
// 1. Extrae 'userId' y 'level' del cuerpo de la petición (req.body).
// 2. Crea un nuevo documento Stats con estos datos.
// 3. Guarda la sesión y devuelve el ID de la misma.
const startLevel = async (req, res) => {
  try {
    const { userId, level, mode  } = req.body;
    const newSession = new Stats({ userId, level, mode });
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

const getSesionesDiarias = async (req, res) => {
  try {
    // Agrupar por día (usando $dateToString para formatear la fecha)
    const resultados = await Stats.aggregate([
      {
        $match: { endTime: { $exists: true } }  // Solo sesiones finalizadas
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
          sesiones: { $sum: 1 },
          duracionPromedio: { $avg: { $divide: ["$durationMs", 1000] } }
        }
      },
      {
        $sort: { _id: 1 }  // Ordenar cronológicamente
      }
    ]);

    res.json({ ok: true, data: resultados });
  } catch (error) {
    console.error("Error obteniendo sesiones diarias:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener sesiones diarias" });
  }
};

// Función para obtener la proporción de usuarios nuevos vs recurrentes
const getProporcionUsuarios = async (req, res) => {
  try {
    // Agregación para contar usuarios nuevos y recurrentes
    const resultados = await Usuario.aggregate([
      {
        $group: {
          _id: "$isnewuser",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Inicializar contadores
    let nuevos = 0;
    let recurrentes = 0;
    let total = 0;
    
    // Procesar resultados
    resultados.forEach(resultado => {
      if (resultado._id === true) {
        nuevos = resultado.count;
      } else {
        recurrentes = resultado.count;
      }
    });
    
    total = nuevos + recurrentes;
    
    // Calcular porcentajes
    const porcentajeNuevos = total > 0 ? (nuevos / total) * 100 : 0;
    const porcentajeRecurrentes = total > 0 ? (recurrentes / total) * 100 : 0;
    
    res.json({
      ok: true,
      data: {
        nuevos,
        recurrentes,
        total,
        porcentajeNuevos,
        porcentajeRecurrentes
      }
    });
  } catch (error) {
    console.error("Error obteniendo proporción de usuarios:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener proporción de usuarios" });
  }
};


// Función para obtener las horas pico de uso de la plataforma
const getHorasPico = async (req, res) => {
  try {
    // Agregar por hora del día (0-23)
    const resultados = await Stats.aggregate([
      {
        $match: { startTime: { $exists: true } }  // Aseguramos que hay tiempo de inicio
      },
      {
        $project: {
          hora: { $hour: "$startTime" },  // Extraer la hora (0-23)
          duracionMs: "$durationMs"
        }
      },
      {
        $group: {
          _id: "$hora",  // Agrupar por hora
          sesiones: { $sum: 1 },  // Contar sesiones
          duracionPromedio: { $avg: "$duracionMs" }  // Duración promedio
        }
      },
      {
        $sort: { _id: 1 }  // Ordenar por hora
      }
    ]);

    res.json({ ok: true, data: resultados });
  } catch (error) {
    console.error("Error obteniendo horas pico:", error);
    res.status(500).json({ ok: false, msg: "Error al obtener horas pico" });
  }
};

const getExamStats = async (req, res) => {
  // Ejemplo: promedio de aciertos por sesión
  const agg = await ExamenSession.aggregate([
    { $group: {
        _id: null,
        avgCorrect: { $avg: '$correct' },
        avgIncorrect: { $avg: '$incorrect' },
        totalSessions: { $sum: 1 }
      }
    }
  ]);
  res.json({ ok: true, data: agg[0] });
};


const getScoreDistribution = async (req, res) => {
  try {
    // Agrupamos sesiones de examen por número de aciertos
    const distribucion = await ExamenSession.aggregate([
      // Opcional: solo contar sesiones completamente terminadas con 5 preguntas
      { $match: { totalQuestions: 5 } },
      {
        $group: {
          _id: '$correct',        // número de aciertos (0–5)
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }       // orden ascendente: 0,1,2,3,4,5
    ]);
    res.json({ ok: true, data: distribucion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al obtener distribución de puntuaciones' });
  }
};


const getTopFailedWords = async (req, res) => {
  try {
    const top5 = await require('../models/exampregunta').aggregate([
      { $match: { answered: true, answeredCorrect: false } },
      { $group: {
          _id: '$correctAnswer',
          fails: { $sum: 1 }
        }
      },
      { $sort: { fails: -1 } },
      { $limit: 5 },
      // traer el texto de la palabra
      {
        $lookup: {
          from: 'palabras',
          localField: '_id',
          foreignField: '_id',
          as: 'word'
        }
      },
      { $unwind: '$word' },
      {
        $project: {
          _id: 0,
          palabra: '$word.palabra',
          fails: 1
        }
      }
    ]);
    res.json({ ok: true, data: top5 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: 'Error al obtener top failed words' });
  }
};

const getPerformanceEvolution = async (req, res) => {
  try {
    const resultados = await ExamenSession.aggregate([
      // sólo sesiones con al menos una pregunta contestada
      { $match: { totalQuestions: { $gt: 0 } } },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          correct: 1,
          total: "$totalQuestions"
        }
      },
      {
        $group: {
          _id: "$date",
          avgCorrectRate: { $avg: { $divide: ["$correct", "$total"] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ ok: true, data: resultados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error al obtener evolución de rendimiento" });
  }
};

// POST /api/stats/category-entry
// Registra que un usuario ha entrado en una categoría en modo libre.
const recordCategoryEntry = async (req, res) => {
  try {
    const userId = req.uid;           // tu middleware validarJWT
    const { categoryId } = req.body;
    await CategoryEntry.create({ userId, categoryId });
    res.json({ ok: true, msg: 'Entrada de categoría registrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error registrando categoría' });
  }
};

// GET /api/stats/popular-categories
// Devuelve las N categorías más populares (por número de entradas)
const getPopularCategories = async (req, res) => {
  try {
    const topN = parseInt(req.query.limit) || 5;
    const populares = await CategoryEntry.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: topN },
      {
        $lookup: {
          from: 'categorias',
          localField: '_id',
          foreignField: '_id',
          as: 'categoria'
        }
      },
      { $unwind: '$categoria' },
      { $project: { _id: 0, categoria: '$categoria.nombre', count: 1 } }
    ]);
    res.json({ ok: true, data: populares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error obteniendo categorías populares' });
  }
};


// POST /api/stats/word-entry
const recordwordEntry = async (req, res) => {
  try {
    const userId     = req.uid;
    const { palabraId } = req.body;
    await WordEntry.create({ userId, palabraId });
    res.json({ ok: true, msg: 'Entrada de palabra registrada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok:false, msg:'Error registrando palabra' });
  }
};

// GET /api/stats/popular-words?limit=N
const getPopularWords = async (req, res) => {
  try {
    const topN = parseInt(req.query.limit) || 10;
    const populares = await WordEntry.aggregate([
      { $group: { _id: '$palabraId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: topN },
      {
        $lookup: {
          from: 'palabras',
          localField: '_id',
          foreignField: '_id',
          as: 'palabra'
        }
      },
      { $unwind: '$palabra' },
      { $project: { _id:0, palabra: '$palabra.palabra', count:1 } }
    ]);
    res.json({ ok: true, data: populares });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok:false, msg:'Error obteniendo palabras populares' });
  }
};


// POST /api/stats/start-category
const startCategorySession = async (req, res) => {
  const userId = req.uid;
  const { categoryId } = req.body;
  const sess = new CategorySession({ userId, categoryId });
  await sess.save();
  res.json({ ok: true, sessionId: sess._id });
};

// PATCH /api/stats/end-category/:sessionId
const endCategorySession = async (req, res) => {
  const { sessionId } = req.params;
  const sess = await CategorySession.findById(sessionId);
  if (!sess) return res.status(404).json({ ok:false, msg:'Sesión no encontrada' });

  sess.endTime = new Date();
  sess.durationMs = sess.endTime - sess.startTime;
  await sess.save();
  res.json({ ok:true, durationMs: sess.durationMs });
};

// GET /api/stats/time-by-category
// promedio en minutos por categoría
const getTimeByCategory = async (req, res) => {
  const agg = await CategorySession.aggregate([
    { $match: { endTime: { $exists: true } } },
    { $group: {
        _id: '$categoryId',
        avgMs: { $avg: '$durationMs' }
      }
    },
    { $lookup: {
        from: 'categorias',
        localField: '_id',
        foreignField: '_id',
        as: 'cat'
      }
    },
    { $unwind: '$cat' },
    { $project: {
        _id: 0,
        category: '$cat.nombre',
        avgMin: { $divide: ['$avgMs', 1000 * 60] }
      }
    },
    { $sort: { avgMin: -1 } }
  ]);
  res.json({ ok:true, data: agg });
};

// GET /api/stats/versus-daily
const getVersusDaily = async (req, res) => {
  try {
    const resultados = await ExamenSession.aggregate([
      // Sólo las partidas ya terminadas (opcional)
      { $match: {  } },
      // Agrupar por día de inicio
      { 
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
          partidas: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ ok: true, data: resultados });
  } catch (error) {
    console.error("Error obteniendo partidas versus diarias:", error);
    res.status(500).json({ ok: false, msg: "Error interno" });
  }
};


module.exports = {
  startLevel,
  endLevel,
  tiemposPorNivel,
  getEstadisticasGenerales,
  getTiempoTotalLibre,
  endMode,
  startMode,
  getSesionesDiarias,
  getProporcionUsuarios,
  getHorasPico,
  getExamStats,
  getScoreDistribution,
  getTopFailedWords,
  getPerformanceEvolution,
  recordCategoryEntry,
  getPopularCategories,
  recordwordEntry,
  getPopularWords,
  startCategorySession,
  endCategorySession,
  getTimeByCategory,
  getVersusDaily
};

