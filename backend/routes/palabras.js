
/*
Ruta base: /api/palabras
*/

const { Router } = require('express');
const {
    obtenerPalabras,
    obtenerPalabra,
    crearPalabra,
    editarPalabra,
    borrarPalabra,
    asociarCategoria,
    obtenerPalabrasPorCategoria
} = require('../controllers/palabras');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const { tieneRol } = require('../middleware/validar-rol');

const router = Router();

// Rutas públicas
router.get('/', obtenerPalabras);
router.get('/categoria', obtenerPalabrasPorCategoria); // Devuelve palabras por categoría
router.get('/:id', obtenerPalabra);

// Rutas restringidas a administradores
router.post('/', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden crear palabras
    check('palabra', 'La palabra es obligatoria').not().isEmpty(),
    validarCampos,
], crearPalabra);

router.put('/:id', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden editar palabras
    check('palabra', 'La palabra es obligatoria').not().isEmpty(),
    validarCampos,
], editarPalabra);

router.delete('/:id', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden borrar palabras
], borrarPalabra);

router.patch('/:id/categoria', [
    validarJWT,
    tieneRol('ROL_ADMIN'), // Solo administradores pueden asociar categorías
    check('categoria', 'La categoría no puede estar vacía').optional().isString(),
    validarCampos,
], asociarCategoria);

module.exports = router;
