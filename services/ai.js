const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const PROMPT_AI = process.env.PROMPT_AI ?? ''

/**
 * Función asincrónica para generar un hilo de tweets basado en la transcripción de audio.
 * @returns {string[]|boolean} - Un array de tweets o `false` en caso de error.
 */
const thread = async (topic = null) => {
    try {

        if (!topic) {
            console.error('Topic');
            return false;
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: PROMPT_AI,
                },
                {
                    role: 'user',
                    content: `Tu misión es desarrollar un hilo en torno a este tópico. Tema:"${topic}"`
                }
            ],
        });

        const tweets = response.choices[0].message.content.split('\n\n');
        return tweets;
    } catch (err) {
        console.error('[ERROR]:', err);
        return false;
    }
};


module.exports = { thread };
