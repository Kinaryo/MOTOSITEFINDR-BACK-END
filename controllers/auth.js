const User = require('../models/user')

module.exports.registerForm =  async (req, res) => {
    res.status(200).json({ message: 'Render registration form' });
}

module.exports.register = async (req, res) => {
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
}

module.exports.loginForm = (req, res) => {
    res.status(200).json({ message: 'Render login form' });
}

module.exports.login = (req, res) => {
    res.status(200).json({ success: true, message: 'Login berhasil' });
};

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'Anda berhasil logout');
        res.status(200).json({ success: true, message: 'Logout berhasil' });
    });
}