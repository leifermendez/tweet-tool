require('dotenv').config()

const express = require("express");
const cors = require("cors");
const { postX } = require('./services/x');
const { thread } = require('./services/ai');

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT ?? 3000

app.post('/post', async (req, res) => {
    const topic = req.body?.topic;
    const post = req.body?.post;
    const fileUrl = req.body?.fileUrl;
    if (!topic) {
        return res.status(400).send('Missing "topic" query parameter.');
    }
    try {
        const tweets = await thread(topic)

        if (post) {
            await postX(tweets, fileUrl)
            console.log('Publicando en tweeter')
        }
        res.send({ tweets })
    } catch (err) {
        console.log(`[ERROR]:`, err)
        res.send(`Error 1`)
    }
})

app.listen(PORT, () => {
    console.log(``)
    console.log(`[POST] http://localhost:${PORT}/post`)
    console.log(``)
})