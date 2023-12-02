const ejsMate = require('ejs-mate');
require('dotenv').config();
const express = require('express');
const ErrorHandler = require('./utils/ErrorHandler');
const Joi = require('joi');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const wrapAsync = require('./utils/wrapAsync');

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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateMotor = (req, res, next) => {
    const { error } = motorSchema.validate(req.body);
    if (error) {
        return next(new ErrorHandler(error.details[0].message, 400));
    } else {
        next();
    }
};

// server route/landing page 
app.get('/',(req,res)=>{
    res.send('Server Motositefinder')
})

// halaman home
app.get('/',(req,res)=>{
    res.send('home')
})

// Endpoint untuk mendapatkan semua data motor dalam bentuk JSON
app.get('/allMotors', wrapAsync(async (req, res) => {
    const motors = await Motor.find();
    res.json({ motors });
}));

// Endpoint untuk mendapatkan detail motor berdasarkan ID dalam bentuk JSON
app.get('/motors/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findById(id);
    res.json({ motor });
}));

app.get('/create/form', (req,res)=>{
    res.send('halaman edit')
})
// menambahkan data motor baru dalam bentuk JSON
app.post('/create/form/motor', validateMotor, wrapAsync(async (req, res, next) => {
    const motor = new Motor(req.body.motor);
    await motor.save();
    res.json({ message: 'Motor added successfully', motor });
}));

// menuju ke halaman edit 
app.get('/motors/:id/edit',wrapAsync(async(req,res)=>{
    const motor = await Motor.findById(req.params.id);
    res.send('halaman edit');
    res.json({message: 'Halaman edit', motor})
}))
// mengupdate data motor berdasarkan ID dalam bentuk JSON
app.put('/motors/:id/edit/update', validateMotor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findByIdAndUpdate(id, { ...req.body.motor });
    res.json({ message: 'Motor updated successfully', motor });
}));

// Endpoint untuk menghapus data motor berdasarkan ID dalam bentuk JSON
app.delete('/api/motors/:id', wrapAsync(async (req, res) => {
    await Motor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Motor deleted successfully' });
}));

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
