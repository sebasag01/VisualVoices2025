const Usuario = require('../models/usuarios');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const validator = require('validator');
const { generarJWT } = require('../helpers/jwt');


const obtenerUsuarios = async(req, res) => {

    // Recibimos el desde
    const desde = Number(req.query.desde) || 0;
    const registropp = Number(process.env.DOCSPERPAGE);

    // Obtenemos el ID de usuario por si quiere buscar solo un usuario
    const id = req.query.id;

    /* const usuarios = await Usuario.find({}, 'nombre apellidos email rol').skip(desde).limit(registropp);
    const total = await Usuario.countDocuments(); */
    try {

        let usuarios, total;
        if (id) {
            if (!validator.isMongoId(id)) {
                return res.json({
                    ok: false,
                    msg: 'El id de usuario debe ser válido'
                });
            }

            [usuarios, total] = await Promise.all([
                Usuario.findById(id),
                Usuario.countDocuments()
            ]);

        } else {
            [usuarios, total] = await Promise.all([
                Usuario.find({}).skip(desde).limit(registropp),
                Usuario.countDocuments()
            ]);
        }

        res.json({
            ok: true,
            msg: 'getUsuarios',
            usuarios,
            page: {
                desde,
                registropp,
                total
            }
        });

    } catch (error) {
        console.log(error);
        res.json({
            ok: false,
            msg: 'Error obteniedo usuarios'
        });
    }

}

const crearUsuario = async (req, res = response) => {
    console.log(req.body); // Log para verificar los datos recibidos
    const { email, password, rol } = req.body;

    try {
        // Verifica si el email ya está registrado
        const existeEmail = await Usuario.findOne({ email });
        if (existeEmail) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado',
            });
        }

        // Validar si el rol es ADMIN y si el usuario autenticado tiene permisos
        if (rol === 'ROL_ADMIN' && req.rol !== 'ROL_ADMIN') {
            return res.status(403).json({
                ok: false,
                msg: 'No tiene permisos para asignar el rol de administrador',
            });
        }

        // Cifrar la contraseña
        const salt = bcrypt.genSaltSync();
        const usuario = new Usuario({
            ...req.body,
            password: bcrypt.hashSync(password, salt),
        });

        // Guardar el usuario en la base de datos
        await usuario.save();

        // Generar el JWT
        const token = await generarJWT(usuario._id, 'ROL_USUARIO');

        // Guardar el token en una cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Cambiar a true en producción con HTTPS
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 horas
        });

        res.status(201).json({
            ok: true,
            msg: 'Usuario registrado correctamente',
            usuario: {
                uid: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: 'ROL_USUARIO',
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear el usuario',
        });
    }
};

const actualizarUsuario = async(req, res = response) => {
    
    const { password, email, ...object } = req.body;
    const uid = req.params.id;

    try{
        console.log('Datos recibidos para actualizar:', req.body); // LOG para depuración

        const existeEmail = await Usuario.findOne({ email: email });

        if(existeEmail){
            
            if(existeEmail._id != uid){
                const valor = existeEmail._id;

                return res.status(400).json({
                    ok: false,
                    msg: 'Email ya existe'
                });
            }
        }

        object.email = email;
        const usuario = await Usuario.findByIdAndUpdate(uid, object, { new: true });
        
        console.log('Usuario actualizado:', usuario); // LOG para depuración

        res.json({
            ok: true,
            msg: 'Usuario actualizado',
            usuario: usuario

        });

    } catch (error){
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error actualizando usuario'
        });
    }
    
    
    
}

const obtenerPalabrasAprendidasPorNivel = async (req, res = response) => {
    try {
      const { id, nivel } = req.params; // ID de usuario y nivel desde la URL
      const usuario = await Usuario.findById(id).populate('exploredFreeWords');
  
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado',
        });
      }
  
      const palabrasAprendidas = usuario.exploredFreeWords.filter(
        (word) => word.nivel === parseInt(nivel)
      );
  
      res.json({
        ok: true,
        palabrasAprendidas: palabrasAprendidas.length,
      });
    } catch (error) {
      console.error('Error obteniendo palabras aprendidas:', error);
      res.status(500).json({
        ok: false,
        msg: 'Error obteniendo palabras aprendidas por nivel',
      });
    }
  };
  

const borrarUsuario = async(req, res = response) => {
    
    const uid = req.params.id;

    try{

        const existeUsuario = await Usuario.findById(uid);
        if(!existeUsuario){
            return res.status(400).json({
                ok:true,
                msg: 'El usuario no existe'
            });
        }

        const resultado = await Usuario.findByIdAndDelete(uid);

        res.json({
            ok: true,
            msg: 'Usuario eliminado',
            resultado: resultado
        });

    } catch (error){
        console.log(error);
        return res.status(400).json({
            ok: true,
            msg: 'Error borrando usuario'
        });
    }
}

// PATCH /api/usuarios/:id/nivel
const actualizarNivelUsuario = async (req, res = response) => {
    try {
        const { id } = req.params;         // ID del usuario en la URL
        const { newLevel } = req.body;     // Nivel nuevo en el body

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            id,
            { currentLevel: newLevel },
            { new: true } // para devolver el usuario ya actualizado
        );

        if (!usuarioActualizado) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no encontrado'
            });
        }

        res.json({
            ok: true,
            msg: 'Nivel actualizado',
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error('Error al actualizar nivel del usuario:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error actualizando nivel del usuario'
        });
    }
};



// PATCH /api/usuarios/:id/indice
const actualizarIndicePalabra = async (req, res = response) => {
    try {
      const { id } = req.params;        // ID del usuario
      const { newIndex } = req.body;    // nuevo índice
      const usuarioActualizado = await Usuario.findByIdAndUpdate(
        id,
        { currentWordIndex: newIndex },
        { new: true }
      );
  
      if (!usuarioActualizado) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado'
        });
      }
  
      res.json({
        ok: true,
        msg: 'Índice de palabra actualizado',
        usuario: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar índice de palabra:', error);
      res.status(500).json({
        ok: false,
        msg: 'Error actualizando índice de palabra'
      });
    }
  };

  const explorarPalabraLibre = async (req, res = response) => {
    try {
      const { id, wordId } = req.params; // id del usuario, wordId de la palabra
      // 1) Buscar al usuario
      const usuario = await Usuario.findById(id);
  
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado'
        });
      }
  
      // 2) Verificamos si la palabra ya está en su array
      const estaYaExplorada = usuario.exploredFreeWords.some(
        word => word.toString() === wordId
      );
  
      // 3) Si NO está, la añadimos
      if (!estaYaExplorada) {
        usuario.exploredFreeWords.push(wordId);
        await usuario.save();
      }
  
      // 4) Devolvemos el usuario o, si quieres, solo la longitud
      return res.json({
        ok: true,
        msg: 'Palabra marcada como explorada (modo libre)',
        totalExploradas: usuario.exploredFreeWords.length,
        usuario
      });
  
    } catch (error) {
      console.error('Error al explorar palabra:', error);
      res.status(500).json({
        ok: false,
        msg: 'Error interno'
      });
    }
  };


  const categoriaMasExplorada = async (req, res = response) => {
    try {
      const { id } = req.params; // ID del usuario
      // 1) Buscar al usuario y popular las palabras de exploredFreeWords y sus categorías
      const usuario = await Usuario.findById(id)
        .populate({
          path: 'exploredFreeWords',
          populate: { path: 'categoria', select: 'nombre ' }, 
        });
  
      if (!usuario) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuario no encontrado',
        });
      }
  
      // 2) Contar cuántas veces aparece cada categoría
      // Creamos un diccionario: categoryId -> conteo
      const conteoCategorias = {};
      usuario.exploredFreeWords.forEach((palabra) => {
        if (!palabra.categoria) return; // si la palabra no tiene categoría
        const catId = String(palabra.categoria._id);
  
        if (!conteoCategorias[catId]) {
          conteoCategorias[catId] = {
            categoriaId: catId,
            nombre: palabra.categoria.nombre,
            count: 0,
          };
        }
        conteoCategorias[catId].count += 1;
      });
  
      // 3) Hallar la categoría con mayor conteo
      let masExplorada = null;
      for (let catId in conteoCategorias) {
        if (!masExplorada || conteoCategorias[catId].count > masExplorada.count) {
          masExplorada = conteoCategorias[catId];
        }
      }
  
      // Si el usuario no tiene palabras exploradas o no hay categorías
      if (!masExplorada) {
        return res.json({
          ok: true,
          categoriaMasExplorada: null,
          msg: 'Ninguna categoría explorada aún'
        });
      }
  
      // 4) Devolver la información de la categoría con más conteo
      res.json({
        ok: true,
        categoriaMasExplorada: {
          categoriaId: masExplorada.categoriaId,
          nombre: masExplorada.nombre,
          count: masExplorada.count
        }
      });
  
    } catch (error) {
      console.error('Error obteniendo categoría más explorada:', error);
      res.status(500).json({
        ok: false,
        msg: 'Error interno al obtener la categoría más explorada'
      });
    }
  };
  
  
  

module.exports = {
    obtenerUsuarios,
    crearUsuario,
    actualizarUsuario, 
    borrarUsuario,
    actualizarNivelUsuario,
    actualizarIndicePalabra,
    explorarPalabraLibre,
    categoriaMasExplorada,
    obtenerPalabrasAprendidasPorNivel,
    obtenerPalabraPorIndice
};
