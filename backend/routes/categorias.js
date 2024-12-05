const { Router } = require('express');
const {
    obtenerCategorias,
    obtenerCategoria,
    crearCategoria,
    editarCategoria,
    eliminarCategoria,
} = require('../controllers/categorias');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { tieneRol } = require('../middleware/validar-rol');

const router = Router();

router.get('/', obtenerCategorias);
router.get('/:id', obtenerCategoria);

router.post('/', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden crear categorías
    validarCampos,
], crearCategoria);

router.put('/:id', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden editar categorías
    validarCampos,
], editarCategoria);

router.delete('/:id', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden eliminar categorías
], eliminarCategoria);

module.exports = router;
