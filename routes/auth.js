const express = require('express');
const router = express();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const { route } = require('./motor');
const passport = require('passport');
const controllersAuth = require('../controllers/auth')

// Register
router.get('/register', controllersAuth.registerForm);

router.post('/register', wrapAsync(controllersAuth.register));

// Login
router.get('/login', controllersAuth.loginForm);

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: {
        type: 'error_msg',
        msg: 'Masukkan password atau username dengan benar',
    },
}), controllersAuth.login )
// Logout
router.post('/logout', controllersAuth.logout);

module.exports = router;
