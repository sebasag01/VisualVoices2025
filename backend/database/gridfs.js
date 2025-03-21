const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const fs = require('fs');

// Este módulo se encarga de manejar la subida y descarga de archivos GLTF en MongoDB mediante GridFS.

// 1) Se configura un manejador de eventos para 'mongoose.connection.on("connected")':
//    - Crea una instancia de GridFSBucket en la base de datos conectada con el nombre "gltfFiles".
//    - Guarda la referencia en la variable 'bucket' para usarla en las funciones siguientes.

// 2) La función 'uploadFile' sube un archivo local a GridFS usando la ruta 'filePath' y el nombre 'fileName':
//    - Verifica si existe el 'bucket' (si está inicializado).
//    - Crea un 'uploadStream' con el 'fileName'.
//    - Usa un 'createReadStream' de Node.js para leer el archivo del sistema de archivos local y enviarlo al flujo de subida de GridFS.
//    - Escucha el evento 'finish' para resolver la Promesa cuando el archivo se ha subido con éxito.
//    - Maneja errores en el flujo de subida.

// 3) La función 'downloadFile' descarga un archivo desde GridFS y lo guarda localmente:
//    - Verifica si 'bucket' está inicializado.
//    - Crea un flujo de descarga desde GridFS usando 'openDownloadStreamByName(fileName)'.
//    - Crea un flujo de escritura local a la ruta 'downloadPath' para guardar el archivo.
//    - Conecta el flujo de descarga al flujo de escritura mediante .pipe().
//    - Escucha el evento 'finish' para resolver la Promesa cuando la descarga haya concluido.
//    - Maneja errores en el flujo de descarga.

let bucket;

mongoose.connection.on('connected', () => {
    const db = mongoose.connection.db;
    bucket = new GridFSBucket(db, { bucketName: 'gltfFiles' });
    console.log('GridFS bucket inicializado');
});

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