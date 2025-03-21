const mongoose = require('mongoose');
require('../models/gltfFiles'); // Registrar el modelo
const Palabra = require('../models/palabras');
const GltfFile = require('../models/gltfFiles'); // Importar el esquema vacío

// La función 'obtenerPalabras' recupera todas las palabras de la base de datos.
// 1. Utiliza el modelo 'Palabra' para realizar la búsqueda completa.
// 2. Incluye los datos de la categoría asociada (solo el campo 'nombre') mediante 'populate'.
// 3. Incluye la información de las animaciones (solo 'filename') mediante un segundo 'populate'.
// 4. Devuelve la lista resultante en la respuesta.
const obtenerPalabras = async (req, res) => {
    try {
        const palabras = await Palabra.find()
            .populate('categoria', 'nombre')
            .populate({
                path: 'animaciones',
                select: 'filename',
            });

        console.log('Palabras desde el backend:', JSON.stringify(palabras, null, 2));
        res.json(palabras);
    } catch (error) {
        console.error('Error al obtener las palabras:', error);
        res.status(500).json({ msg: 'Error al obtener las palabras' });
    }
};

// La función 'obtenerPalabra' busca y devuelve una palabra específica por su ID.
// 1. Extrae el 'id' desde los parámetros de la ruta.
// 2. Usa 'findById' para obtener la palabra correspondiente en la base de datos.
// 3. Devuelve un error 404 si no se encuentra la palabra, o la palabra en formato JSON en caso contrario.
const obtenerPalabra = async (req, res) => {
    const { id } = req.params;
    const palabra = await Palabra.findById(id);
    if (!palabra) {
        return res.status(404).json({ msg: 'Palabra no encontrada' });
    }
    res.json(palabra);
};

// La función 'crearPalabra' crea una nueva palabra en la base de datos.
// 1. Crea una instancia del modelo 'Palabra' con los datos del cuerpo (req.body).
// 2. Guarda la nueva palabra.
// 3. Utiliza 'populate' para obtener el nombre de la categoría asociada.
// 4. Devuelve un estado 201 junto con la nueva palabra creada.
const crearPalabra = async (req, res) => {
    try {
        const nuevaPalabra = new Palabra(req.body);
        await nuevaPalabra.save();
        const palabraConCategoria = await nuevaPalabra.populate('categoria', 'nombre');

        res.status(201).json({
            ok: true,
            palabra: palabraConCategoria,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la palabra',
        });
    }
};

// La función 'editarPalabra' actualiza los datos de una palabra específica.
// 1. Extrae el 'id' y los campos que se quieren actualizar del cuerpo de la petición.
// 2. Utiliza 'findByIdAndUpdate' para modificar los campos que existan en el cuerpo (palabra, categoría, animaciones, etc.).
// 3. Emplea la opción '{ new: true }' para devolver el documento actualizado.
// 4. Hace un 'populate' en el campo 'categoria' para extraer solo el 'nombre' de la categoría asociada.
// 5. Si no encuentra la palabra, devuelve un error 404; en caso contrario, devuelve la palabra actualizada.
const editarPalabra = async (req, res) => {
    const { id } = req.params;
    const { palabra, categoria, animaciones, explicacion, nivel, orden } = req.body;

    try {
        const palabraEditada = await Palabra.findByIdAndUpdate(
            id,
            { 
                ...(palabra && { palabra }),
                ...(categoria && { categoria }),
                ...(animaciones && { animaciones }),
                ...(explicacion && { explicacion }),
                ...(nivel !== undefined && { nivel }),
                ...(orden !== undefined && { orden })
            },
            { new: true }
        ).populate('categoria', 'nombre');

        if (!palabraEditada) {
            return res.status(404).json({ ok: false, msg: 'Palabra no encontrada' });
        }

        res.json({
            ok: true,
            palabra: palabraEditada,
        });
    } catch (error) {
        console.error('Error al actualizar la palabra:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la palabra',
        });
    }
};

// La función 'borrarPalabra' elimina una palabra de la base de datos por su ID.
// 1. Usa 'findByIdAndDelete' para eliminar el documento correspondiente.
// 2. Si no lo encuentra, devuelve un error 404; de lo contrario, confirma la eliminación.
const borrarPalabra = async (req, res) => {
    const { id } = req.params;
    const palabraEliminada = await Palabra.findByIdAndDelete(id);
    if (!palabraEliminada) {
        return res.status(404).json({ msg: 'Palabra no encontrada' });
    }
    res.json({ msg: 'Palabra eliminada' });
};

// La función 'asociarCategoria' vincula una palabra específica con una categoría.
// 1. Extrae el 'id' de la palabra y el 'categoria' desde el cuerpo de la petición.
// 2. Usa 'findByIdAndUpdate' para asignar la categoría a la palabra.
// 3. Si no encuentra la palabra, devuelve un error 404; de lo contrario, retorna la palabra actualizada.
const asociarCategoria = async (req, res) => {
    const { id } = req.params;
    const { categoria } = req.body;
    const palabraActualizada = await Palabra.findByIdAndUpdate(
        id,
        { categoria },
        { new: true }
    );
    if (!palabraActualizada) {
        return res.status(404).json({ msg: 'Palabra no encontrada' });
    }
    res.json(palabraActualizada);
};

// La función 'obtenerPalabrasPorCategoria' devuelve una lista de palabras
// que pertenecen a una categoría específica.
// 1. Recibe el identificador de la categoría en la query string (req.query.categoria).
// 2. Utiliza 'Palabra.find' para buscar las palabras que coincidan con la categoría.
// 3. Hace 'populate' para mostrar el nombre de la categoría y el 'filename' de las animaciones.
// 4. Devuelve el resultado en JSON o un error 500 en caso de fallar.
const obtenerPalabrasPorCategoria = async (req, res) => {
    const { categoria } = req.query;

    try {
        if (!categoria) {
            return res.status(400).json({
                ok: false,
                msg: 'El parámetro "categoria" es obligatorio',
            });
        }

        const palabras = await Palabra.find({ categoria })
            .populate('categoria', 'nombre')
            .populate({
                path: 'animaciones',
                model: 'gltfFiles.files',
                select: 'filename',
            });

        console.log('Palabras encontradas con animaciones completas:', JSON.stringify(palabras, null, 2));
        res.json(palabras);
    } catch (error) {
        console.error('Error al obtener palabras por categoría:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las palabras por categoría',
        });
    }
};

// La función 'obtenerPalabrasPorNivel' filtra las palabras según un nivel específico.
// 1. Toma el parámetro 'nivel' de la query string y lo convierte a número.
// 2. Si no se encuentra el nivel, responde con un error 400.
// 3. Busca en la base de datos todas las palabras con ese nivel y las ordena por 'orden' ascendente.
// 4. Aplica 'populate' para recuperar la categoría y los filenames de las animaciones.
// 5. Retorna la lista de palabras o un error en caso de fallo.
const obtenerPalabrasPorNivel = async (req, res) => {
    try {
      const { nivel } = req.query;
      const nivelNum = parseInt(nivel, 10);
  
      if (!nivelNum) {
        return res.status(400).json({ msg: 'Falta el parámetro nivel' });
      }
  
      const palabras = await Palabra.find({ nivel: nivelNum })
        .sort({ orden: 1 })
        .populate('categoria', 'nombre')
        .populate({
            path: 'animaciones',
            select: 'filename',
        });

      res.json(palabras);
    } catch (error) {
      console.error('Error al obtener palabras por nivel:', error);
      res.status(500).json({ msg: 'Error al obtener palabras' });
    }
};

module.exports = {
    obtenerPalabras,
    obtenerPalabra,
    crearPalabra,
    editarPalabra,
    borrarPalabra,
    asociarCategoria,
    obtenerPalabrasPorCategoria,
    obtenerPalabrasPorNivel
};

