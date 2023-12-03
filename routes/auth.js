const express = require('express');
const router = express();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

// Register
router.get('/register', async (req, res) => {
    res.json({ message: 'Render registration form' });
});

router.post('/register', wrapAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        await User.register(user, password);
        res.status(200).json({ success: true, message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Login
router.get('/login', (req, res) => {
    res.json({ message: 'Render login form' });
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: {
        type: 'error_msg',
        msg: 'Enter the password or username correctly',
    },
}), (req, res) => {
    res.status(200).json({ success: true, message: 'Login successful' });
});

module.exports = router;
