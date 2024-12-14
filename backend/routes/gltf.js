const { Router } = require('express');
const { subirArchivoGltf, descargarArchivoGltf } = require('../controllers/gltf');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal para almacenar archivos

const router = Router();

router.post('/upload', upload.single('file'), subirArchivoGltf);

router.get('/download/:name', descargarArchivoGltf);

module.exports = router;
