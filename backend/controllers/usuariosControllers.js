// /controllers/usuariosController.js

let usuarios = []; // Temporal, reemplazar con base de datos cuando sea necesario

// Obtener todos los usuarios
const getUsuarios = (req, res) => {
    res.json(usuarios);
};

// Crear un nuevo usuario
const createUsuario = (req, res) => {
    const nuevoUsuario = req.body;
    usuarios.push(nuevoUsuario);
    res.status(201).json(nuevoUsuario);
};

// Actualizar un usuario por ID
const updateUsuario = (req, res) => {
    const id = req.params.id;
    const usuarioActualizado = req.body;
    const index = usuarios.findIndex(u => u.id == id);

    if (index !== -1) {
        usuarios[index] = usuarioActualizado;
        res.json(usuarioActualizado);
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
};

// Eliminar un usuario por ID
const deleteUsuario = (req, res) => {
    const id = req.params.id;
    const index = usuarios.findIndex(u => u.id == id);

    if (index !== -1) {
        usuarios.splice(index, 1);
        res.json({ message: 'Usuario eliminado' });
    } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
    }
};

module.exports = {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario
};
