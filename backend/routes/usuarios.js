/*
Ruta base: /api/usuarios
*/

const { Router } = require("express");
const {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  borrarUsuario,
  actualizarNivelUsuario,
  actualizarIndicePalabra,
  explorarPalabraLibre, categoriaMasExplorada,
  obtenerPalabrasAprendidasPorNivel,
  actualizarLastWordLearned,
  updateFirstTime

} = require("../controllers/usuarios");
const { check } = require("express-validator");
const { validarCampos } = require("../middleware/validar-campos");
const { validarJWT } = require("../middleware/validar-jwt");
const { tieneRol } = require("../middleware/validar-rol");

const router = Router();

router.get("/", obtenerUsuarios);

router.get('/:id/palabras-aprendidas/:nivel', obtenerPalabrasAprendidasPorNivel);

router.get("/:id/ultima-palabra", [validarJWT]);

router.patch('/:id/first-time', [validarJWT], updateFirstTime);


router.post(
  "/",
  [
    //check("nombre", "El argumento nombre es obligatorio").not().isEmpty(),
    //check("apellidos", "El argumento apellidos es obligatorio").not().isEmpty(),
    check("email", "El argumento email es obligatorio").not().isEmpty(),
    check("password", "El argumento password es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  crearUsuario
);

router.get(
  "/:id/palabras-aprendidas/:nivel",
  [validarJWT],
  obtenerPalabrasAprendidasPorNivel
);

router.put(
  "/:id",
  [
    validarJWT,
    //check("nombre", "El argumento nombre es obligatorio").not().isEmpty(),
    //check("apellidos", "El argumento apellidos es obligatorio").not().isEmpty(),
    check("email", "El argumento email es obligatorio").not().isEmpty(),
    check("id", "El identificador no es válido").isMongoId(),
    validarCampos,
    tieneRol("ROL_ADMIN"),
  ],
  actualizarUsuario
);

router.delete(
  "/:id",
  [
    validarJWT,
    tieneRol("ROL_ADMIN"),
    check("id", "El identificador no es válido").isMongoId(),
    validarCampos,
  ],
  borrarUsuario
);

router.patch("/:id/nivel", [validarJWT], actualizarNivelUsuario);

router.patch("/:id/indice", [validarJWT], actualizarIndicePalabra);

router.patch('/:id/explore-word/:wordId', [
    validarJWT,
  ], explorarPalabraLibre);

router.get('/:id/categoria-mas-explorada', validarJWT, categoriaMasExplorada);
router.patch('/:id/lastWord', validarJWT, actualizarLastWordLearned);


module.exports = router;


// Este archivo define todas las rutas relativas a la gestión de usuarios en la aplicación,
// con la ruta base '/api/usuarios'.
//
// 1. Se importan los controladores desde 'controllers/usuarios' para manejar las acciones de
//    obtener, crear, actualizar y borrar usuarios, así como para manejar la lógica de niveles,
//    palabras exploradas, etc.
//
// 2. Se incluyen middlewares de validación y autenticación, como 'validarCampos', 'validarJWT' y 'tieneRol',
//    para restringir y verificar el correcto envío de datos y permisos.
//
// Rutas principales:
//
//  GET '/':
//    - Obtiene la lista de usuarios, con o sin paginación. 
//
//  GET '/:id/palabras-aprendidas/:nivel':
//    - Verifica cuántas palabras exploradas de determinado nivel tiene un usuario, usando el controlador 'obtenerPalabrasAprendidasPorNivel'.
//
//  GET '/:id/ultima-palabra':
//    - (Middleware 'validarJWT' para validar el token, aunque aquí no se llama a un controlador en el snippet mostrado,
//      posiblemente se use para una futura lógica u otro middleware.)
//
//  PATCH '/:id/first-time':
//    - Actualiza el indicador de si el usuario es nuevo o no ('isnewuser'), validando el token con 'validarJWT'.
//    - Llama al controlador 'updateFirstTime'.
//
//  POST '/':
//    - Crea un usuario nuevo, verificando campos como 'email' y 'password'. 
//    - Utiliza 'validarCampos' para manejar errores de validación y el controlador 'crearUsuario' para la lógica de creación.
//
//  PUT '/:id':
//    - Actualiza los datos de un usuario específico, usando 'actualizarUsuario'.
//    - Verifica que sea un ID de Mongo válido ('check("id").isMongoId()') y que el rol del usuario autenticado sea 'ROL_ADMIN'.
//
//  DELETE '/:id':
//    - Elimina a un usuario por su ID, protegiendo la ruta con 'validarJWT' y 'tieneRol("ROL_ADMIN")'.
//    - Verifica que el 'id' sea un MongoId válido antes de llamar al controlador 'borrarUsuario'.
//
//  PATCH '/:id/nivel':
//    - Actualiza el nivel actual del usuario (currentLevel), invocando 'actualizarNivelUsuario'.
//
//  PATCH '/:id/indice':
//    - Actualiza el índice de la palabra que el usuario está aprendiendo (currentWordIndex).
//
//  PATCH '/:id/explore-word/:wordId':
//    - Añade una palabra al array de palabras exploradas por el usuario si aún no está incluida.
//    - Utiliza 'explorarPalabraLibre' como controlador.
//
//  GET '/:id/categoria-mas-explorada':
//    - Devuelve la categoría más explorada del usuario. 
//
//  PATCH '/:id/lastWord':
//    - Actualiza el campo 'lastWordLearned' para indicar la última palabra aprendida por el usuario.
//
// Al final, se exporta el router para que sea usado en la configuración principal de rutas de la aplicación.
