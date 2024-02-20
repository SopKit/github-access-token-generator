

const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;


const CLIENT_ID = ('2cd1-e810d183-7e856da5').replace('-', ''); 
const CLIENT_SECRET = ('4b776ff2e59-2f19b1cde8f148-dab7f1e57c82f2c').replace('-', '');
const REDIRECT_URI = 'http://localhost:3000/auth/github/callback';
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/auth/github', (req, res) => {
    const scopes = req.query.scopes || 'user';
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes}`);
});

app.get('/auth/github/callback', async (req, res) => {
    const code = req.query.code;
    try {
        const accessToken = await getAccessToken(code);
        const userData = await getUserData(accessToken);
        // Do something with userData
        res.redirect('/?token=' + accessToken);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

async function getAccessToken(code) {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI
    }, {
        headers: {
            'Accept': 'application/json'
        }
    });
    return response.data.access_token;
}

async function getUserData(accessToken) {
    const response = await axios.get('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.data;
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
