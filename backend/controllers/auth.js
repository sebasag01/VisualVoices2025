const { response } = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarios');
const { generarJWT } = require('../helpers/jwt');

const login = async (req, res = response) => {
    const { email, password, rememberMe } = req.body; // Añadimos rememberMe
  
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
      const cookieExpiry = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  
      // Enviar el token como una cookie segura
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Cambiar a true en producción con HTTPS
        sameSite: 'strict',
        maxAge: cookieExpiry, // Tiempo de expiración dinámico
      });
  
      res.json({
        ok: true,
        msg: 'login',
        token
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        ok: false,
        msg: 'Error en login',
      });
    }
  };
  

  const logout = (req, res) => {
    console.log('[DEBUG] Cerrando sesión, eliminando cookie...');
    res.clearCookie('token', {
      httpOnly: true,
      secure: false, // Cambiar a true en producción con HTTPS
      sameSite: 'strict',
    });
    res.json({
      ok: true,
      msg: 'Sesión cerrada correctamente',
    });
  };
    
module.exports = { login, logout };