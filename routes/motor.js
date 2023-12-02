const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const isValidObjectId = require('../middleware/isValidObjectId')
// model
const Motor = require('../models/motor');

// schema
const { motorSchema } = require('../schemas/motor');

const router = express.Router();

const validateMotor = (req, res, next) => {
    const { error } = motorSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        console.log(error);
        return next(new ErrorHandler(error.details[0].message, 400));
    } else {
        next();
    }
};


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
router.get('/Searchpages', wrapAsync(async (req, res) => {
      let motors;

      // Handling search
      if (req.query.search) {
        const searchRegex = new RegExp(escapeRegex(req.query.search), 'gi');
        motors = await Motor.find({ title: searchRegex });
      } else {
        // Handling filter
        if (req.query.sortBy === 'terbaru') {
          motors = await Motor.find().sort({ dateTime: -1 });
        } else if (req.query.sortBy === 'terlama') {
          motors = await Motor.find().sort({ dateTime: 1 });
        } else {
          motors = await Motor.find();
        }
      }
    //   Mengirim data sebagai JSON
      res.json({ motors });
    })
  );

// Endpoint untuk mendapatkan semua data motor dalam bentuk JSON
router.get('/', wrapAsync(async (req, res) => {
    const motors = await Motor.find();
    const msg = req.flash('succes_msg','motor fetched successfully')
    res.json({msg, motors });
}));

// mendapatkan detail motor berdasarkan ID dalam bentuk JSON
router.get('/:id',isValidObjectId('/motors'),wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findById(id).populate('comments');
    res.json({ motor });
}));

router.get('/create/form', (req, res) => {
    res.json({ message: 'Halaman edit' });
});

// Menambahkan data motor baru dalam bentuk JSON
router.post('/create/form/motor', validateMotor, wrapAsync(async (req, res) => {
    const motor = new Motor(req.body.motor);
    await motor.save();
    req.flash('success_msg','Selamat, anda berhasil menambahkan data')
    res.json({ message: 'Motor added successfully', motor });
}));

// Menuju ke halaman edit
router.get('/:id/edit',isValidObjectId('/motors'),wrapAsync(async (req, res) => {
    const motor = await Motor.findById(req.params.id);
    res.json({ message: 'Halaman edit', motor });
}));

// Mengupdate data motor berdasarkan ID dalam bentuk JSON
router.put('/:id/edit/update',isValidObjectId('/motors'), validateMotor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findByIdAndUpdate(id, { ...req.body.motor });
    res.json({ message: 'Motor updated successfully', motor });
}));

// menghapus data motor berdasarkan ID dalam bentuk JSON
router.delete('/:id',isValidObjectId('/motors'), wrapAsync(async (req, res) => {
    await Motor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Motor deleted successfully' });
}));

module.exports = router;
