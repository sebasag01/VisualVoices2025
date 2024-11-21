// /controllers/usuariosControllers.js

const bcrypt = require('bcrypt');
const User = require('../models/User');

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await User.findAll(); // Busca todos los usuarios en la base de datos
        res.json(usuarios); // Envía los usuarios como respuesta en formato JSON
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' }); // Envía una respuesta de error si ocurre un problema
    }
};

// Crear un nuevo usuario (temporal, reemplazar con la base de datos)
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

// Registrar un nuevo usuario
const registerUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Verifica si el usuario ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encripta la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crea el usuario
        const newUser = await User.create({ username, password: hashedPassword, email });
        res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario', error });
    }
};

// Iniciar sesión de usuario
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Comparar la contraseña ingresada con la almacenada
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Inicio de sesión exitoso
        console.log('Usuario ha iniciado sesión con éxito');
        res.json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};

module.exports = {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    registerUser,
    loginUser
};
