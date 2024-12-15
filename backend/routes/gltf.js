const { Router } = require('express');
const { subirArchivoGltf, descargarArchivoGltf } = require('../controllers/gltf');
const multer = require('multer');
const mongoose = require('mongoose');

const upload = multer({ dest: 'uploads/' }); // Carpeta temporal para almacenar archivos
const router = Router();

// Subir un archivo GLTF
router.post('/upload', upload.single('file'), subirArchivoGltf);
// Descargar un archivo GLTF (usando un nombre específico)
router.get('/download/:name', descargarArchivoGltf);

// Ruta para obtener un archivo GLTF por filename desde GridFS
router.get('/animaciones/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const db = mongoose.connection.db; // Conexión a la base de datos
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'gltfFiles' });

        // Stream del archivo GLTF desde GridFS
        const downloadStream = bucket.openDownloadStreamByName(filename);

        // Pipea el archivo al cliente
        downloadStream.on('error', (err) => {
            console.error('Error al descargar el archivo:', err);
            res.status(404).json({ msg: 'Archivo no encontrado' });
        });

        res.set('Content-Type', 'model/gltf+json'); // Tipo de contenido GLTF
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error al servir el archivo GLTF:', error);
        res.status(500).json({ msg: 'Error al servir el archivo GLTF' });
    }
});

module.exports = router;
