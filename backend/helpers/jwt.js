const jwt = require('jsonwebtoken');

// La función 'generarJWT' crea un token JWT con los datos de usuario (uid y rol).
// 1. Define un 'payload' con 'uid' y 'rol'.
// 2. Usa 'jwt.sign' para generar el token, usando la clave secreta almacenada en 'process.env.JWTSECRET'.
// 3. Configura la expiración en 24 horas ('expiresIn: "24h"').
// 4. Retorna el token en una Promesa; en caso de error, rechaza la Promesa con un mensaje.

const generarJWT = (uid, rol) => {

    return new Promise((resolve, reject) => {

        const payload = {
            uid,
            rol
        }

        jwt.sign(payload, process.env.JWTSECRET, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el JWT');
            } else {
                resolve(token);
            }
        });

    });
}

module.exports = { generarJWT }