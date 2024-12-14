const { Router } = require('express');
const { login } = require('../controllers/auth');
const { crearUsuario } = require('../controllers/usuarios');
const { check } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');
const { validarJWT } = require('../middleware/validar-jwt');
const Usuario = require('../models/usuarios');

const router = Router();


router.get('/usuario', validarJWT, async (req, res) => {
    const { uid } = req;

    try {
        // Buscar al usuario completo por su ID
        const usuario = await Usuario.findById(uid, 'nombre rol'); // Solo obtenemos los campos necesarios

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado',
            });
        }

        // Enviar únicamente los datos mínimos necesarios
        res.json({
            ok: true,
            usuario: {
                uid: usuario._id, // Usamos _id como uid
                nombre: usuario.nombre,
                rol: usuario.rol,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener el usuario',
        });
    }
});

router.post('/', [
    check('password', 'El argumento pasword es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    validarCampos,
], login);

router.post('/', [
    check('nombre', 'El argumento nombre es obligatorio').not().isEmpty(),
    check('apellidos', 'El argumento apellidos es obligatorio').not().isEmpty(),
    check('email', 'El argumento email es obligatorio').not().isEmpty(),
    check('password', 'El argumento password es obligatorio').not().isEmpty(),
    validarCampos,
], crearUsuario);


module.exports = router;