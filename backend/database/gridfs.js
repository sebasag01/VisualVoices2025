const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');

// Inicializa el bucket de GridFS
let bucket;

mongoose.connection.on('connected', () => {
    const db = mongoose.connection.db;
    bucket = new GridFSBucket(db, { bucketName: 'gltfFiles' });
    console.log('GridFS bucket inicializado');
});

// Subir archivo GLTF
const uploadFile = (filePath, fileName) => {
    return new Promise((resolve, reject) => {
        if (!bucket) {
            return reject(new Error('GridFS no está inicializado'));
        }
        const uploadStream = bucket.openUploadStream(fileName);
        fs.createReadStream(filePath)
            .pipe(uploadStream)
            .on('finish', () => {
                console.log(`Archivo ${fileName} subido correctamente`);
                resolve(uploadStream.id);
            })
            .on('error', (error) => {
                console.error('Error al subir el archivo:', error);
                reject(error);
            });
    });
};

// Descargar archivo GLTF
const downloadFile = (fileName, downloadPath) => {
    return new Promise((resolve, reject) => {
        if (!bucket) {
            return reject(new Error('GridFS no está inicializado'));
        }
        const downloadStream = bucket.openDownloadStreamByName(fileName);
        const writeStream = fs.createWriteStream(downloadPath);

        downloadStream
            .pipe(writeStream)
            .on('finish', () => {
                console.log(`Archivo ${fileName} descargado correctamente`);
                resolve();
            })
            .on('error', (error) => {
                console.error('Error al descargar el archivo:', error);
                reject(error);
            });
    });
};

module.exports = {
    uploadFile,
    downloadFile,
};
