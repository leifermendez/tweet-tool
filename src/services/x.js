const { TwitterApi } = require("twitter-api-v2");
const { getImageBufferFromUrl } = require("../utils/download-image");

/**
 * Función para realizar publicaciones en Twitter.
 * @param {string | string[]} tweets - Texto o array de textos de los tweets a publicar.
 * @param {string} [fileUrl] - URL de la imagen a adjuntar en el tweet (opcional).
 * @param {string} [replyId] - ID del tweet al que se responde (opcional).
 * @returns {Promise<boolean>} - Promesa que resuelve a true si la publicación es exitosa, false en caso de error.
 */
const postX = async (tweets, fileUrl, replyId) => {
    try {
        const client = new TwitterApi({
            appKey: process.env.X_CONSUMER_KEY,
            appSecret: process.env.X_CONSUMER_SECRET,
            accessToken: process.env.X_ACCESS_KEY,
            accessSecret: process.env.X_ACCESS_SECRET,
        });

        const twitterClient = client.readWrite;

        const thread = [];

        const payload = {};


        if (replyId) {
            payload.reply = {
                in_reply_to_tweet_id: replyId,
            };
        }

        if (fileUrl) {
            const buffer = await getImageBufferFromUrl(fileUrl);
            const idMedia = await twitterClient.v1.uploadMedia(buffer.imageBuffer, { type: buffer.type.ext });
            payload.media = {
                media_ids: [idMedia],
            };
        }

        for (const tweetText of Array.isArray(tweets) ? tweets : [tweets]) {
            if (thread.length) {
                delete payload.media;
                payload.reply = {
                    in_reply_to_tweet_id: thread.pop(),
                };
            }

            const tweetResponse = await twitterClient.v2.tweet(tweetText.slice(0, 280), payload);
            thread.push(tweetResponse.data.id);
        }

        return true;
    } catch (error) {
        console.error("Error al publicar en Twitter:", error);
        return false;
    }
};

module.exports = { postX };
