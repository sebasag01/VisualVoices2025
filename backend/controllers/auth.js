const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');
const { generarJWT } = require('../helpers/jwt');

const login = async(req, res = response) => {
    
    const { email, password } = req.body;

    try {
        const usuarioBD = await Usuario.findOne({ email }, 'password rol');
        
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const validPassword = bcrypt.compareSync(password, usuarioBD.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Usuario o contraseña incorrectos',
                token: ''
            });
        }

        const token = await generarJWT(usuarioBD._id, usuarioBD.rol);

        // Enviar el token como una cookie segura
        res.cookie('token', token, {
            httpOnly: true, // Evita el acceso mediante JavaScript
            secure: false, // Cambiar a true en producción con HTTPS
            sameSite: 'strict', // Evita el uso en contextos externos
            maxAge: 24 * 60 * 60 * 1000, // 24 horas
        });

        res.json({
            ok: true,
            msg: 'login',
            token
        });

    } catch (error) {
            console.log(error);
            return res.status(400).json({
                ok: false,
                msg: 'Error en login',
                token: ''
            });
    }

}

module.exports = { login }