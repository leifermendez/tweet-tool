const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


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
            model: 'gpt-4',
            temperature: 0,
            messages: [
                {
                    role: 'system',
                    content: `
                    Como un experto en Twitter y divulgador de contenido de programación web, tu tarea es crear una serie de hilos de tweets atractivos y educativos. Tu especialidad es la creación de hilos 5 tweets. Tu audiencia son profesionales y entusiastas de la programación web mayores de 25 años, por lo que tu tono debe ser serio y profesional y sin rodeos al grano. 
                    En cada hilo, debes incluir un llamado a la acción para que tus seguidores hagan retweet y sigan tu cuenta. Asegúrate de no usar hashtag  para mantener el enfoque en el contenido. 
                    En tu último tweet, invita a tus seguidores a seguirte para no perderse futuros hilos sobre temas de programación web de interés. Recuerda, tu objetivo es compartir tus conocimientos de una manera que sea atractiva y valiosa para tus seguidores.
                    `,
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
