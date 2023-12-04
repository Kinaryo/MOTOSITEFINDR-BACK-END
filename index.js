const ejsMate = require('ejs-mate');
require('dotenv').config();
const express = require('express');
const session = require('express-session')
const cors = require('cors')
const ErrorHandler = require('./utils/ErrorHandler');
const Joi = require('joi');
const flash = require('connect-flash')
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

const wrapAsync = require('./utils/wrapAsync');
const isValidObjectId = require('./middlewares/isValidObjectId')


const passport = require('passport')
const LocalStrategy = require('passport-local')

// models
const User =require('./models/user')

const PORT = process.env.PORT || 3000;
mongoose.set('strictQuery', false);
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

const Motor = require('./models/motor');
const Comment = require('./models/comment');
const { motorSchema } = require('./schemas/motor');
const { commentSchema } = require('./schemas/comment'); // Fixed import path

app.use(cors());
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

// inisialisasi session 
app.use(session(
    {
        secret: 'this-is-a-secret-key',
        resave: false,
        saveUnitialized : false,
        cookie:{
            httpOnly: true,
            expires: Date.now()+1000*60*60*24*7,
            maxAge: 100*60*60*24*27
        }
    }
))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg')
    next();
})
// Server route/landing page
app.get('/', (req, res) => {
    res.send('Server Motositefinder');
});

// Halaman home
app.get('/home', (req, res) => {
    res.send('home');
});
app.get('motor/:id',isValidObjectId('/motors'),wrapAsync(constrollersMotor.detail));
app.use('/',require('./routes/auth') )
app.use('/motors',require('./routes/motor'))
app.use('/motors/:motor_id/comments',require('./routes/comment'))

app.all('*', (req, res, next) => {
    next(new ErrorHandler('Page not Found', 404));
});

// Middleware untuk menangani suatu error
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error', { err });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening On Port ${PORT}`);
    });
});
