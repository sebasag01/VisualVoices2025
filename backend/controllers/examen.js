// controllers/examen.js
const Palabra = require('../models/palabras');
const exampregunta = require('../models/exampregunta');
const Usuario = require('../models/usuarios');

/**
 * Genera una sola pregunta con:
 * - 1 palabra correcta (con su animación)
 * - 3 palabras "distractoras" o incorrectas
 * Devuelve las 4 opciones en orden aleatorio,
 * junto con un questionId para que el front
 * pueda luego verificar su respuesta sin
 * necesitar saber cuál era la correcta.
 */
const generarPregunta = async (req, res) => {
  try {
    // 1. Verificar que tenemos un usuario logueado
    const userId = req.uid; // Asumiendo que validarJWT adjunta el uid a req

    // 2. Obtener una palabra aleatoria (correcta)
    const totalPalabras = await Palabra.countDocuments();
    if (totalPalabras < 4) {
      return res.status(400).json({
        ok: false,
        msg: 'No hay suficientes palabras en la BD para generar 4 opciones',
      });
    }

    const randomIndex = Math.floor(Math.random() * totalPalabras);
    const palabraCorrecta = await Palabra.findOne().skip(randomIndex)
      .populate('categoria', 'nombre')
      .populate({
        path: 'animaciones',
        select: 'filename',
      });

    // 3. Obtener otras 3 palabras distintas de la correcta
    const palabrasDistractoras = await Palabra.aggregate([
      { $match: { _id: { $ne: palabraCorrecta._id } } },
      { $sample: { size: 3 } }
    ]);

    // 4. Prepara arrays de opciones
    const opcionCorrecta = {
      _id: palabraCorrecta._id,
      palabra: palabraCorrecta.palabra,
      animaciones: palabraCorrecta.animaciones // para si quieres mostrar algo
    };
    const opcionesIncorrectas = palabrasDistractoras.map((p) => ({
      _id: p._id,
      palabra: p.palabra,
      animaciones: p.animaciones
    }));

    // Mezclar todo
    const todasLasOpciones = [opcionCorrecta, ...opcionesIncorrectas];
    for (let i = todasLasOpciones.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [todasLasOpciones[i], todasLasOpciones[j]] = [todasLasOpciones[j], todasLasOpciones[i]];
    }

    // 5. Crear un registro ephemeral en la BD con la info de la pregunta
    const examQ = new exampregunta({
      user: userId,
      correctAnswer: palabraCorrecta._id
    });
    await examQ.save();

    // 6. Devolver las opciones, la animación y el questionId
    //    Sin exponer qué opción es la correcta
    return res.json({
      ok: true,
      questionId: examQ._id,      // Para que el front luego verifique
      correctAnswerId: palabraCorrecta._id,  // Añade esta línea
      animaciones: palabraCorrecta.animaciones, // La animacion a reproducir
      opciones: todasLasOpciones.map(opc => ({
        _id: opc._id,
        palabra: opc.palabra
      }))
    });

  } catch (error) {
    console.error('Error al generar pregunta:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error interno al generar la pregunta',
    });
  }
};

/**
 * Verifica la respuesta elegida por el usuario
 * - Recibe questionId y selectedAnswerId en el body
 * - Busca la exampregunta y verifica si se corresponde
 *   con el usuario y si la respuesta es correcta.
 * - Actualiza statsExamen del usuario en caso de acierto/error.
 */
const verificarRespuesta = async (req, res) => {
  try {
    const userId = req.uid; // viene del JWT
    const { questionId, selectedAnswerId } = req.body;

    // 1. Buscamos la exampregunta
    const examQ = await exampregunta.findById(questionId);
    if (!examQ) {
      return res.status(404).json({
        ok: false,
        msg: 'Pregunta no encontrada o expirada'
      });
    }

    // 2. Verificar que la pregunta pertenece a este usuario
    if (examQ.user.toString() !== userId) {
      return res.status(403).json({
        ok: false,
        msg: 'No tienes permiso para responder esta pregunta'
      });
    }

    // 3. Verificar si ya fue respondida
    if (examQ.answered) {
      return res.status(400).json({
        ok: false,
        msg: 'Esta pregunta ya fue respondida'
      });
    }

    // 4. Marcarla como respondida
    examQ.answered = true;
    await examQ.save();

    // 5. Verificar si la opción seleccionada es la correcta
    const acierto = (examQ.correctAnswer.toString() === selectedAnswerId);

    // 6. Actualizar contadores (statsExamen) en el usuario
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    if (!usuario.statsExamen) {
      usuario.statsExamen = { correctas: 0, incorrectas: 0 };
    }

    if (acierto) {
      usuario.statsExamen.correctas += 1;
    } else {
      usuario.statsExamen.incorrectas += 1;
    }

    await usuario.save();

    // 7. Responder al front
    return res.json({
      ok: true,
      esCorrecta: acierto,
      msg: acierto ? '¡Respuesta correcta!' : 'Respuesta incorrecta',
      statsExamen: usuario.statsExamen
    });

  } catch (error) {
    console.error('Error al verificar respuesta:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error interno al verificar respuesta',
    });
  }
};

module.exports = {
  generarPregunta,
  verificarRespuesta,
};
