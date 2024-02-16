require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { TwitterApi } = require('twitter-api-v2');
const { postX } = require('./services/x');
const { thread } = require('./services/ai');

const app = express();

app.use(cors());
app.use(express.json());
app.set('trust proxy', 1);
app.use(
    session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: true
    })
);

const PORT = process.env.PORT || 3000;

/**
 * POST endpoint to post tweets.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.post('/post', async (req, res) => {
    const { topic, post, fileUrl } = req.body;

    if (!topic) {
        return res.status(400).send('Missing "topic" query parameter.');
    }

    if (!process.env.ACCESS_KEY) {
        return res.status(400).send('Debes primero agregar ACCESS_KEY')
    }

    if (!process.env.ACCESS_SECRET) {
        return res.status(400).send('Debes primero agregar ACCESS_SECRET')
    }

    try {
        const tweets = await thread(topic);

        if (post) {
            await postX(tweets, fileUrl);
            console.log('Published on Twitter');
        }

        res.send({ tweets });
    } catch (err) {
        console.error('[ERROR]:', err);
        res.status(500).send(err.message);
    }
});

/**
 * GET endpoint to initiate Twitter login.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get('/login', async (req, res) => {
    const callbackUrl = `${req.protocol}://${req.get('host')}/callback`;

    const client = new TwitterApi({
        appKey: process.env.CONSUMER_KEY,
        appSecret: process.env.CONSUMER_SECRET
    });

    try {
        const authLink = await client.generateAuthLink(callbackUrl, {
            linkMode: 'authorize'
        });

        req.session.oauth_token_secret = authLink.oauth_token_secret;
        res.redirect(authLink.url);
    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(500).send('Error initiating Twitter login');
    }
});

/**
 * GET endpoint to handle Twitter callback.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
app.get('/callback', async (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;
    const { oauth_token_secret } = req.session;

    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
        return res.status(400).send('Invalid request parameters');
    }

    const client = new TwitterApi({
        appKey: process.env.CONSUMER_KEY,
        appSecret: process.env.CONSUMER_SECRET,
        accessToken: oauth_token,
        accessSecret: oauth_token_secret
    });

    try {
        const { accessToken, accessSecret } = await client.login(oauth_verifier);
        res.send({
            accessToken,
            accessSecret
        });
    } catch (error) {
        console.error('[ERROR]:', error);
        res.status(403).send('Invalid verifier or access tokens');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
