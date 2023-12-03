const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const ErrorHandler = require('../utils/ErrorHandler');
const isValidObjectId = require('../middlewares/isValidObjectId')
const isAuth = require('../middlewares/isAuth')
const isAuthor = require('../middlewares/isAuthor')
// model
const Motor = require('../models/motor');
const router = express.Router();
// schema
const { motorSchema } = require('../schemas/motor');



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
  const {id} = req.params
  const motors = await Motor.find(id)
  const msg = req.flash('succes_msg','motor fetched successfully')
   res.json({msg, motors });
}));

// mendapatkan detail motor berdasarkan ID dalam bentuk JSON
router.get('/:id',isValidObjectId('/motors'),wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findById(id)
    .populate({
      path : 'comments',
      populate:{
        path:'author'
      }
    })
    .populate('author')
console.log(motor)
    res.json({ motor });
}));

router.get('/create/form', isAuth, (req, res) => {
    res.json({ message: 'Halaman edit' });
});

// Menambahkan data motor baru dalam bentuk JSON
router.post('/create/form/motor',isAuth, validateMotor, wrapAsync(async (req, res) => {
    const motor = new Motor(req.body.motor);
    motor.author = req.user._id;
    await motor.save();
    req.flash('success_msg','Selamat, anda berhasil menambahkan data')
    res.json({ message: 'Motor added successfully', motor });
}));

// Menuju ke halaman edit
router.get('/:id/edit',isAuth,isAuthor.isAuthorMotor, isValidObjectId('/motors'),wrapAsync(async (req, res) => {
    const motor = await Motor.findById(req.params.id);
    res.json({ message: 'Halaman edit', motor });
}));

// Mengupdate data motor berdasarkan ID dalam bentuk JSON
router.put('/:id/edit/update',isAuth,isAuthor.isAuthorMotor,isValidObjectId('/motors'), validateMotor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findByIdAndUpdate(id, { ...req.body.motor });
    req.flash('success_msg','Anda berhasil meng-update data');
    res.json({ message: 'Motor updated successfully', motor });
}));

// menghapus data motor berdasarkan ID dalam bentuk JSON
router.delete('/:id',isAuth,isAuthor.isAuthorMotor,isValidObjectId('/motors'), wrapAsync(async (req, res) => {
    await Motor.findByIdAndDelete(req.params.id);
    const msg = req.flash('success_msg','Data berhasil dihapus');
    res.json({ message: 'Motor deleted successfully' });
}));

module.exports = router;
