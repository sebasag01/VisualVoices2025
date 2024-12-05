const mongoose = require('mongoose');
const Palabra = require('../models/palabras');

// Obtener todas las palabras
const obtenerPalabras = async (req, res) => {
    const palabras = await Palabra.find().populate('categoria', 'nombre');
    res.json(palabras);
};

// Obtener una palabra específica
const obtenerPalabra = async (req, res) => {
    const { id } = req.params;
    const palabra = await Palabra.findById(id);
    if (!palabra) {
        return res.status(404).json({ msg: 'Palabra no encontrada' });
    }
    res.json(palabra);
};

// Crear una palabra
const crearPalabra = async (req, res) => {
    try {
        const nuevaPalabra = new Palabra(req.body);
        await nuevaPalabra.save();
        res.status(201).json({
            ok: true,
            palabra: nuevaPalabra,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la palabra',
        });
    }
};

// Editar una palabra
const editarPalabra = async (req, res) => {
    const { id } = req.params;
    const { palabra, categoria } = req.body;

    try {
        const palabraEditada = await Palabra.findByIdAndUpdate(
            id,
            { palabra, categoria },
            { new: true }
        );
        if (!palabraEditada) {
            return res.status(404).json({ ok: false, msg: 'Palabra no encontrada' });
        }
        res.json({
            ok: true,
            palabra: palabraEditada,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la palabra',
        });
    }
};

// Borrar una palabra
const borrarPalabra = async (req, res) => {
    const { id } = req.params;
    const palabraEliminada = await Palabra.findByIdAndDelete(id);
    if (!palabraEliminada) {
        return res.status(404).json({ msg: 'Palabra no encontrada' });
    }
    res.json({ msg: 'Palabra eliminada' });
};

// Asociar una palabra a una categoría
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


const obtenerPalabrasPorCategoria = async (req, res) => {
    const { categoria } = req.query;

    console.log('Request recibido:', req.query);

    try {
        if (!categoria) {
            return res.status(400).json({
                ok: false,
                msg: 'El parámetro "categoria" es obligatorio',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(categoria)) {
            console.error(`ID de categoría inválido: ${categoria}`);
            return res.status(400).json({
                ok: false,
                msg: 'El ID de la categoría no es válido',
            });
        }

        const categoriaId = new mongoose.Types.ObjectId(categoria);
        const palabras = await Palabra.find({ categoria: categoriaId }).populate('categoria', 'nombre');

        console.log('Palabras encontradas:', palabras);

        res.json(palabras);
    } catch (error) {
        console.error('Error al obtener palabras por categoría:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener las palabras por categoría',
        });
    }
};



module.exports = {
    obtenerPalabras,
    obtenerPalabra,
    crearPalabra,
    editarPalabra,
    borrarPalabra,
    asociarCategoria,
    obtenerPalabrasPorCategoria
};
