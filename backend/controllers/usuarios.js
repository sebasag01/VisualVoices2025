const Usuario = require('../models/usuarios');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { response } = require('express');
const validator = require('validator');
const { generarJWT } = require('../helpers/jwt');

// La función 'obtenerUsuarios' se encarga de listar usuarios de la base de datos, 
// soportando paginación y la opción de filtrar por un usuario en concreto a través de un 'id'.
// 1. Toma el parámetro 'desde' desde la query (para la paginación).
// 2. Lee la variable DOCSPERPAGE desde el entorno para definir la cantidad de resultados por página.
// 3. Si se pasa un 'id', valida su formato MongoId; de ser válido, devuelve únicamente ese usuario.
// 4. En caso de no pasar un 'id', devuelve la lista completa de usuarios con paginación.
// 5. Devuelve también el número total de documentos en la colección.
const obtenerUsuarios = async (req, res) => {
  const desde = Number(req.query.desde) || 0;
  const registropp = Number(process.env.DOCSPERPAGE);
  const id = req.query.id;

  try {
      let usuarios, total;

      if (id) {
          // Valida si el id es un MongoId
          if (!validator.isMongoId(id)) {
              return res.json({
                  ok: false,
                  msg: 'El id de usuario debe ser válido'
              });
          }

          // Busca un solo usuario si se pasó el 'id'
          [usuarios, total] = await Promise.all([
              Usuario.findById(id),
              Usuario.countDocuments()
          ]);
      } else {
          // Retorna todos los usuarios, con paginación
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
};

// La función 'crearUsuario' crea un nuevo usuario en la base de datos.
// 1. Verifica que el correo no exista ya en la colección.
// 2. Si se solicita crear un usuario con rol 'ROL_ADMIN', comprueba que 
//    el usuario autenticado tenga también rol de administrador.
// 3. Genera la contraseña hasheada usando bcrypt.
// 4. Guarda el nuevo usuario en la base de datos.
// 5. Genera un token JWT y lo almacena en una cookie con caducidad de 24 horas.
const crearUsuario = async (req, res = response) => {
  console.log(req.body);
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

      // Revisa permisos al asignar rol de administrador
      if (rol === 'ROL_ADMIN' && req.rol !== 'ROL_ADMIN') {
          return res.status(403).json({
              ok: false,
              msg: 'No tiene permisos para asignar el rol de administrador',
          });
      }

      // Cifrado de contraseña
      const salt = bcrypt.genSaltSync();
      const usuario = new Usuario({
          ...req.body,
          password: bcrypt.hashSync(password, salt),
      });

      // Guardar el usuario en la base de datos
      await usuario.save();

      // Generar el JWT
      const token = await generarJWT(usuario._id, 'ROL_USUARIO');

      // Configurar la cookie con el token
      res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000, // 24 horas
      });

      res.status(201).json({
          ok: true,
          msg: 'Usuario registrado correctamente',
          usuario: {
              uid: usuario._id,
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

// La función 'actualizarUsuario' modifica los datos de un usuario existente.
// 1. Extrae los campos relevantes del cuerpo (excluyendo 'password').
// 2. Verifica si el nuevo 'email' ya está siendo usado por otro usuario distinto.
// 3. Actualiza el usuario en la base de datos con 'findByIdAndUpdate'.
// 4. Devuelve los datos del usuario actualizado.
const actualizarUsuario = async (req, res = response) => {
  const { password, email, ...object } = req.body;
  const uid = req.params.id;

  try {
      console.log('Datos recibidos para actualizar:', req.body);

      // Verifica si el email ya existe en la colección
      const existeEmail = await Usuario.findOne({ email: email });

      if (existeEmail) {
          if (existeEmail._id != uid) {
              return res.status(400).json({
                  ok: false,
                  msg: 'Email ya existe'
              });
          }
      }

      object.email = email;
      const usuario = await Usuario.findByIdAndUpdate(uid, object, { new: true });
      
      console.log('Usuario actualizado:', usuario);

      res.json({
          ok: true,
          msg: 'Usuario actualizado',
          usuario: usuario
      });

  } catch (error) {
      console.log(error);
      return res.status(400).json({
          ok: false,
          msg: 'Error actualizando usuario'
      });
  }
};

// La función 'obtenerPalabrasAprendidasPorNivel' retorna el número de palabras 
// de un cierto nivel (parámetro 'nivel') que el usuario (parámetro 'id') tiene 
// en su arreglo 'exploredFreeWords'.
// 1. Busca el usuario por id y hace un 'populate' de 'exploredFreeWords'.
// 2. Filtra las palabras del nivel correspondiente.
// 3. Retorna la longitud de ese filtro.
const obtenerPalabrasAprendidasPorNivel = async (req, res = response) => {
  try {
    const { id, nivel } = req.params;
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

// La función 'borrarUsuario' elimina un usuario de la base de datos por su ID.
// 1. Verifica si el usuario existe en la colección.
// 2. Si existe, se elimina y se devuelve un mensaje confirmando la operación.
const borrarUsuario = async (req, res = response) => {
  const uid = req.params.id;

  try {
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
};

// La función 'actualizarNivelUsuario' actualiza el campo 'currentLevel' de un usuario.
// 1. Toma el ID del usuario desde la URL (req.params.id).
// 2. Toma el nuevo nivel desde el cuerpo de la petición (req.body.newLevel).
// 3. Retorna el objeto del usuario actualizado.
const actualizarNivelUsuario = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { newLevel, preserveMaxLevel } = req.body;

    console.log('Nivel update request:', { 
      userId: id, 
      newLevel, 
      preserveMaxLevel,
      requestBody: req.body // Log the entire body to see what's coming in
    });

    // Buscamos al usuario primero
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    console.log('User before update:', {
      currentLevel: usuario.currentLevel,
      maxUnlockedLevel: usuario.maxUnlockedLevel
    });

    // Actualizamos el nivel de la sesión actual
    usuario.currentLevel = newLevel;
    
    // Si el nuevo nivel es mayor que el máximo desbloqueado, actualizamos maxUnlockedLevel
    if (newLevel > usuario.maxUnlockedLevel) {
      usuario.maxUnlockedLevel = newLevel;
    }
    // No hacemos nada si el nuevo nivel es menor y preserveMaxLevel es true
    // Esto preserva el nivel máximo desbloqueado

    await usuario.save();

    console.log('User after update:', {
      currentLevel: usuario.currentLevel,
      maxUnlockedLevel: usuario.maxUnlockedLevel
    });

    res.json({
      ok: true,
      msg: 'Nivel actualizado',
      usuario: usuario
    });
  } catch (error) {
    console.error('Error al actualizar nivel del usuario:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error actualizando nivel del usuario'
    });
  }
};


// La función 'actualizarIndicePalabra' actualiza el índice de la palabra que el usuario 
// está aprendiendo actualmente.
// 1. Toma el ID del usuario desde los parámetros (req.params.id).
// 2. Recibe el nuevo índice desde req.body.newIndex.
// 3. Devuelve los datos del usuario ya actualizado.
const actualizarIndicePalabra = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { newIndex } = req.body;
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

// La función 'explorarPalabraLibre' añade una palabra al array 'exploredFreeWords' de un usuario.
// 1. Toma los parámetros 'id' (usuario) y 'wordId' (palabra).
// 2. Si la palabra no está ya en la lista, se agrega.
// 3. Devuelve el total de palabras exploradas y el usuario actualizado.
const explorarPalabraLibre = async (req, res = response) => {
  try {
    const { id, wordId } = req.params;
    const usuario = await Usuario.findById(id);

    if (!usuario) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    const estaYaExplorada = usuario.exploredFreeWords.some(
      word => word.toString() === wordId
    );

    if (!estaYaExplorada) {
      usuario.exploredFreeWords.push(wordId);
      await usuario.save();
    }

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

// La función 'categoriaMasExplorada' retorna la categoría que más palabras tiene 
// exploradas por un usuario.
// 1. Busca el usuario por ID y hace 'populate' de las palabras exploradas y su categoría.
// 2. Cuenta cuántas veces aparece cada categoría dentro de 'exploredFreeWords'.
// 3. Devuelve la categoría con mayor count o un mensaje si no hay ninguna explorada.
const categoriaMasExplorada = async (req, res = response) => {
  try {
    const { id } = req.params;
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

    const conteoCategorias = {};
    usuario.exploredFreeWords.forEach((palabra) => {
      if (!palabra.categoria) return;
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

    let masExplorada = null;
    for (let catId in conteoCategorias) {
      if (!masExplorada || conteoCategorias[catId].count > masExplorada.count) {
        masExplorada = conteoCategorias[catId];
      }
    }

    if (!masExplorada) {
      return res.json({
        ok: true,
        categoriaMasExplorada: null,
        msg: 'Ninguna categoría explorada aún'
      });
    }

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

// La función 'actualizarLastWordLearned' registra la última palabra aprendida por el usuario.
// 1. Toma el 'id' del usuario desde la URL y la palabra desde el body (lastWord).
// 2. Actualiza el campo 'lastWordLearned' con dicha palabra.
// 3. Retorna el usuario actualizado.
const actualizarLastWordLearned = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { lastWord } = req.body;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { lastWordLearned: lastWord },
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
      msg: 'Última palabra aprendida actualizada',
      usuario: usuarioActualizado
    });

  } catch (error) {
    console.error('Error al actualizar la última palabra aprendida:', error);
    res.status(500).json({
      ok: false,
      msg: 'Error interno al actualizar la última palabra aprendida'
    });
  }
};

// La función 'updateFirstTime' actualiza el flag 'isnewuser' en el usuario.
// 1. Toma el 'id' del usuario de la ruta.
// 2. Toma el valor booleano 'isnewuser' desde el body.
// 3. Actualiza el documento del usuario y lo retorna.
const updateFirstTime = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { isnewuser } = req.body; 

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      { isnewuser },
      { new: true }
    );

    if (!usuarioActualizado) {
      return res.status(404).json({
        ok: false,
        msg: 'Usuario no encontrado'
      });
    }

    return res.json({
      ok: true,
      msg: 'isnewuser actualizado',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar isnewuser :', error);
    res.status(500).json({
      ok: false,
      msg: 'Error al actualizar isnewuser '
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
  actualizarLastWordLearned,
  updateFirstTime
};

