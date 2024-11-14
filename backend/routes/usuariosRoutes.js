// /routes/usuariosRoutes.js

const express = require('express');
const router = express.Router();
const {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    registerUser
} = require('../controllers/usuariosControllers');

// Definir las rutas CRUD para usuarios y la ruta de registro
router.get('/', getUsuarios);
router.post('/', createUsuario);
router.post('/register', registerUser); // Asegúrate de que esta ruta apunte a registerUser
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

module.exports = router;
