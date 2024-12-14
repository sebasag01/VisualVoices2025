const { uploadFile, downloadFile } = require('../database/gridfs');

const subirArchivoGltf = async (req, res) => {
    const filePath = req.file.path; // Ruta del archivo subido
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
    const downloadPath = `./downloads/${fileName}`;

    try {
        await downloadFile(fileName, downloadPath);
        res.download(downloadPath);
    } catch (error) {
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
