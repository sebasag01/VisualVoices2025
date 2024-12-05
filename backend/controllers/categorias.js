const Categoria = require('../models/categorias');

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
    const categorias = await Categoria.find();
    res.json(categorias);
};

// Obtener una categoría específica
const obtenerCategoria = async (req, res) => {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);
    if (!categoria) {
        return res.status(404).json({ msg: 'Categoría no encontrada' });
    }
    res.json(categoria);
};

// Crear una nueva categoría
const crearCategoria = async (req, res) => {
    try {
        const nuevaCategoria = new Categoria(req.body);
        await nuevaCategoria.save();
        res.status(201).json({
            ok: true,
            categoria: nuevaCategoria,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la categoría',
        });
    }
};

// Editar una categoría
const editarCategoria = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    try {
        const categoriaEditada = await Categoria.findByIdAndUpdate(
            id,
            { nombre },
            { new: true }
        );
        if (!categoriaEditada) {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }
        res.json(categoriaEditada);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la categoría',
        });
    }
};

// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
    const { id } = req.params;

    try {
        const categoriaEliminada = await Categoria.findByIdAndDelete(id);
        if (!categoriaEliminada) {
            return res.status(404).json({ msg: 'Categoría no encontrada' });
        }
        res.json({ msg: 'Categoría eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la categoría',
        });
    }
};

module.exports = {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    editarCategoria,
    eliminarCategoria,
};
