// La función 'validarCampos' se utiliza como middleware para verificar si hay errores de validación
// en la solicitud (req) generados por 'express-validator'.
// 1. Obtiene los errores de validación mediante 'validationResult(req)'.
// 2. Si hay errores, se envía una respuesta con estado 400 y un objeto JSON con los errores.
// 3. Si no hay errores, se llama a 'next()' para continuar con la siguiente función o ruta.

const { response } = require('express');
const { validationResult } = require('express-validator');

const validarCampos = (req, res = response, next) => {
    
    const erroresVal = validationResult(req);
    if (!erroresVal.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errores: erroresVal.mapped()
        });
    }
    next();
}

module.exports = { validarCampos }