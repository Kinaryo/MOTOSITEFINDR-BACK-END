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

// Endpoint untuk mendapatkan semua data motor dalam bentuk JSON
app.get('/api/motors', wrapAsync(async (req, res) => {
    const motors = await Motor.find();
    res.json({ motors });
}));

// Endpoint untuk mendapatkan detail motor berdasarkan ID dalam bentuk JSON
app.get('/api/motors/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findById(id);
    res.json({ motor });
}));

// Endpoint untuk menambahkan data motor baru dalam bentuk JSON
app.post('/api/motors', validateMotor, wrapAsync(async (req, res, next) => {
    const motor = new Motor(req.body.motor);
    await motor.save();
    res.json({ message: 'Motor added successfully', motor });
}));

// Endpoint untuk mengupdate data motor berdasarkan ID dalam bentuk JSON
app.put('/api/motors/:id', validateMotor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findByIdAndUpdate(id, { ...req.body.motor });
    res.json({ message: 'Motor updated successfully', motor });
}));

// Endpoint untuk menghapus data motor berdasarkan ID dalam bentuk JSON
app.delete('/api/motors/:id', wrapAsync(async (req, res) => {
    await Motor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Motor deleted successfully' });
}));

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening On Port ${PORT}`);
    });
});
