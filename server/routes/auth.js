const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    // Disable public registration
    return res.status(403).json({ msg: 'Registration is currently closed for this instance.' });

    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required' });
        }
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ username, password });
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Register error:', err.message, err.stack);
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Login error:', err.message, err.stack);
        res.status(500).json({ msg: 'Server error: ' + err.message });
    }
});

module.exports = router;
