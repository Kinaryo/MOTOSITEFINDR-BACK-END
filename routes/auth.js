const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');

router.get('/register', async (req, res) => {
    res.status(200).json({ message: 'Render registration form' });
});

router.post(
    '/register',
    wrapAsync(async (req, res) => {
        try {
            const { email, username, password } = req.body;
            const user = new User({ email, username });
            const registerUser = await User.register(user, password);

            req.login(registerUser, (err) => {
                if (err) return next(err);
                req.flash('success_msg', 'Registrasi berhasil, Anda berhasil login');
                res.status(200).json({ success: true, message: 'Registrasi berhasil' });
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    })
);

router.get('/login', (req, res) => {
    res.status(200).json({ message: 'Render login form' });
});

router.post(
    '/login',
    passport.authenticate('local', {
        failureRedirect: '/login',
        failureFlash: {
            type: 'error_msg',
            msg: 'Masukkan password atau username dengan benar',
        },
    }),
    (req, res) => {
        res.status(200).json({ success: true, message: 'Login berhasil' });
    }
);

router.post('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Anda berhasil logout');
        res.status(200).json({ success: true, message: 'Logout berhasil' });
    });
});

module.exports = router;
