// /routes/usuariosRoutes.js

const express = require('express');
const router = express.Router();
const {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario
} = require('../controllers/usuariosControllers');

// Definir las rutas CRUD para usuarios
router.get('/', getUsuarios);
router.post('/', createUsuario);
router.put('/:id', updateUsuario);
router.delete('/:id', deleteUsuario);

module.exports = router;
