const ejsMate = require('ejs-mate')
require('dotenv').config();
const express = require('express');
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const path = require ('path')
const app = express();
const passport = require('passport')
const LocalStrategy = require('passport-local')

// models
const User =require('./models/user')
// connect to mngodb

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


app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

// middleware untuk mendapatkan data dari body 
app.use(express.urlencoded({extended:true}));
// mengubahmethod post menjadi method yang akan di pakai melalui query 
app.use(methodOverride('_method'))
// folder public untuk file static 
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
    // pengkondisian logout
    res.locals.currentUser = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg')
    next();
})


app.get('/',(req,res)=>{
    res.render('home')
})

app.use('/',require('./routes/auth') )
app.use('/pages',require('./routes/motor'))
app.use('/pages/:motor_id/comments',require('./routes/comment'))


//melihat eror sementara 
app.all('*',(req,res,next)=>{
    next(new ErrorHandler('Page not Faund',404))
})

// middleware untuk menangani suatu error
app.use((err,req,res,next)=>{
    const {statusCode = 500 } = err;
    if(!err.message) err.message = "oh no, Something went wrong"
    res.status(statusCode).render('error',{err})

})
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening On Port ${PORT}`);
    });
});
