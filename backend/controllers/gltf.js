const mongoose = require('mongoose');
const { uploadFile } = require('../database/gridfs');

const subirArchivoGltf = async (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
        const fileId = await uploadFile(filePath, fileName);
        res.json({
            ok: true,
            msg: 'Archivo subido correctamente',
            fileId,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al subir el archivo',
            error,
        });
    }
};

const descargarArchivoGltf = async (req, res) => {
    const fileName = req.params.name;

    try {
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'gltfFiles'
        });

        // Buscar el archivo por nombre
        const files = await bucket.find({ filename: fileName }).toArray();
        
        if (!files || files.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Archivo no encontrado'
            });
        }

        // Configurar headers
        res.set('Content-Type', 'model/gltf+json');
        res.set('Content-Disposition', `attachment; filename="${fileName}"`);

        // Crear stream de lectura y enviarlo directamente al cliente
        const downloadStream = bucket.openDownloadStreamByName(fileName);
        downloadStream.pipe(res);

        downloadStream.on('error', () => {
            res.status(500).json({
                ok: false,
                msg: 'Error al descargar el archivo'
            });
        });
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
        res.status(500).json({
            ok: false,
            msg: 'Error al descargar el archivo',
            error,
        });
    }
};

module.exports = {
    subirArchivoGltf,
    descargarArchivoGltf,
};
