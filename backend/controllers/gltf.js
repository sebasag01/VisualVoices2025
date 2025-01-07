const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const subirArchivoGltf = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ msg: 'No se ha proporcionado ningún archivo' });
    }

    try {
        const fileStream = fs.createReadStream(req.file.path);
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'gltfFiles' });

        // Verificar si el archivo ya existe
        const existingFiles = await bucket.find({ filename: req.file.originalname }).toArray();
        if (existingFiles.length > 0) {
            // Si existe, eliminar el archivo anterior
            for (const file of existingFiles) {
                await bucket.delete(file._id);
            }
        }

        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            contentType: 'model/gltf+json'
        });

        fileStream.pipe(uploadStream);

        uploadStream.on('error', (error) => {
            console.error('Error al subir el archivo:', error);
            fs.unlinkSync(req.file.path);
            res.status(500).json({ msg: 'Error al subir el archivo' });
        });

        uploadStream.on('finish', () => {
            console.log('Archivo subido correctamente');
            fs.unlinkSync(req.file.path);
            res.status(200).json({ msg: 'Archivo subido correctamente' });
        });
    } catch (error) {
        console.error('Error en subirArchivoGltf:', error);
        if (req.file && req.file.path) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ msg: 'Error al procesar el archivo', error: error.message });
    }
};

const descargarArchivoGltf = async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'gltfFiles' });
        
        const file = await bucket.find({ filename: req.params.name }).toArray();
        if (!file || file.length === 0) {
            return res.status(404).json({ msg: 'Archivo no encontrado' });
        }

        res.set('Content-Type', 'model/gltf+json');
        res.set('Cache-Control', 'public, max-age=31536000');

        const downloadStream = bucket.openDownloadStreamByName(req.params.name);
        downloadStream.pipe(res);

        downloadStream.on('error', (error) => {
            console.error('Error al descargar el archivo:', error);
            res.status(500).json({ msg: 'Error al descargar el archivo' });
        });
    } catch (error) {
        console.error('Error en descargarArchivoGltf:', error);
        res.status(500).json({ msg: 'Error al procesar la descarga', error: error.message });
    }
};

module.exports = {
    subirArchivoGltf,
    descargarArchivoGltf
};
