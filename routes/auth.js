const express = require('express')
const AuthController = require('../controllers/auth')
const router = express();
const User = require ('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const { route } = require('./motor');
const passport = require('passport')


// register
router.route('/register')
    .get(AuthController.registerForm )
    .post(wrapAsync(AuthController.register))

router.route('/login')
    .get (AuthController.loginForm )
    .post(passport.authenticate('local',{
    failureRedirect:'/login',
    failureFlash: {
        type: 'error_msg',
        msg: 'masukan password atau Usrename dengan benar'
    }
}), AuthController.login)

router.post('/logout', AuthController.logout)

    module.exports = router