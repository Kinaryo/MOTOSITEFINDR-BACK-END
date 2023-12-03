const ejsMate = require('ejs-mate');
require('dotenv').config();
const express = require('express');
const cors = ('cors')
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user'); // Pastikan Anda mengimpor model User

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);

// Fungsi untuk menghubungkan ke MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Konfigurasi view engine dan middleware
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'this-is-a-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 100 * 60 * 60 * 24 * 27
    }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Global middleware untuk data pengguna
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Routes
app.get('/', (req, res) => {
    res.render('home');
});

app.use('/', require('./routes/auth'));
app.use('/pages', require('./routes/motor'));
app.use('/pages/:motor_id/comments', require('./routes/comment'));

// Handling error sementara
app.all('*', (req, res, next) => {
    next(new ErrorHandler('Page not Found', 404));
});

// Middleware untuk menangani error
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong";
    res.status(statusCode).render('error', { err });
});

// Menghubungkan ke MongoDB dan menjalankan server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://127.0.0.1:${PORT}`);
    });
});
