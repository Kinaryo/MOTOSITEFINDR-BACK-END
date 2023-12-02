const express = require('express')
const wrapAsync = require('../utils/wrapAsync')
const ErrorHandler = require('../utils/ErrorHandler')
// model
const Motor = require('../models/motor')
// schema 
const {motorSchema} = require('../schemas/motor')

const router = express.Router();

const validateMotor = (req,res,next)=>{
    const {error} = motorSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        console.log(error)
        return next(new ErrorHandler(error.details[0].message,400))
    }else{
        next()
    }
}


// Server route/landing page
app.get('/', (req, res) => {
    res.send('Server Motositefinder');
});

// Halaman home
app.get('/home', (req, res) => {
    res.send('home');
});

// Endpoint untuk mendapatkan semua data motor dalam bentuk JSON
app.get('/motors', wrapAsync(async (req, res) => {
    const motors = await Motor.find();
    res.json({ motors });
}));

// mendapatkan detail motor berdasarkan ID dalam bentuk JSON
app.get('/motors/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findById(id).populate('comments');

    res.json({ motor });
}));

app.get('motors/create/form', (req, res) => {
    res.json({ message: 'Halaman edit', motor });
});

// Menambahkan data motor baru dalam bentuk JSON
app.post('motors/create/form/motor', validateMotor, wrapAsync(async (req, res, next) => {
    const motor = new Motor(req.body.motor);
    await motor.save();
    res.json({ message: 'Motor added successfully', motor });
}));

// Menuju ke halaman edit
app.get('/motors/:id/edit', wrapAsync(async (req, res) => {
    const motor = await Motor.findById(req.params.id);
    res.json({ message: 'Halaman edit', motor });
}));

// Mengupdate data motor berdasarkan ID dalam bentuk JSON
app.put('/motors/:id/edit/update', validateMotor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findByIdAndUpdate(id, { ...req.body.motor });
    res.json({ message: 'Motor updated successfully', motor });
}));

// menghapus data motor berdasarkan ID dalam bentuk JSON
app.delete('/motors/:id', wrapAsync(async (req, res) => {
    await Motor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Motor deleted successfully' });
}));


module.exports= router;