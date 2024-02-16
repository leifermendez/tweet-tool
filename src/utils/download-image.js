const axios = require('axios');

const getImageBufferFromUrl = async (imageUrl) => {
    try {
        const fileType = await import('file-type');

        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const type = await fileType.fileTypeFromBuffer(response.data);
        const imageBuffer = Buffer.from(response.data, 'binary');
        return { imageBuffer, type };
    } catch (error) {
        console.error('Error al obtener la imagen:', error.message);
        throw error;
    }
}

module.exports = { getImageBufferFromUrl }