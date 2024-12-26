const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = 5000;

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://adarshlilhare5000:Ada3%40rsh3%23@cluster1.n1mp0.mongodb.net/your_db_name?retryWrites=true&w=majority';

// Replace with your actual Spotify credentials
const CLIENT_ID = 'your key';
const CLIENT_SECRET = 'your key';
const REDIRECT_URI = 'your localhost url';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Get Access Token
app.get('/login', (req, res) => {
    const scope = 'user-read-private user-read-email user-library-read';
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`);
});

// Callback Route
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    const accessToken = tokenResponse.data.access_token;
    res.redirect(`/?access_token=${accessToken}`); // Redirect to frontend with access token
});

// User Signup
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const newUser = new User({ email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        res.status(400).json({ error: 'Error creating user' });
    }
});

// User Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.status(200).json({ message: 'Login successful!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
