const express = require('express')
const wrapAsync = require('../utils/wrapAsync')
const ErrorHandler = require('../utils/ErrorHandler')
const isValidObjectId = require('../middlewares/isValidObjectId')
const isAuth = require('../middlewares/isAuth')
const {isAuthorMotor}  = require('../middlewares/isAuthor')
const {validateMotor} = require('../middlewares/validator')
const upload = require('../config/multer')
// model
const Motor = require('../models/motor')
const MotorController = require('../controllers/motor')
// schema 
const router = express.Router();
const {motorSchema} = require('../schemas/motor')


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  
// search dan filtering 
router.get('/search', wrapAsync(async (req, res) => {
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
  
      res.render('pages/index', { motors });
    })
  );

// submit post
router.route('/')
  .get( wrapAsync(MotorController.index))
  .post(isAuth,upload.array('image',5),validateMotor, wrapAsync(MotorController.store))
  // .post(isAuth, upload.array('image', 5), (req,res)=>{
  //   console.log(req.files)
  //   console.log(req.body)
  //   res.send('its works')
  // })

// create/form post
router.get('/post', isAuth, MotorController.post)


// details
router.route('/:id')
  .get(isValidObjectId('/pages'),wrapAsync(MotorController.detail))
// update mengirim dari halaman edit
  .put(isAuth, isAuthorMotor, isValidObjectId('/pages'), upload.array('image',5),validateMotor,wrapAsync(MotorController.update))
// delete motor 
  .delete(isAuth,isAuthorMotor,isValidObjectId('/pages'), wrapAsync(MotorController.destroy))
//  masuk kedalam halaman edit
  router.get('/:id/editForm',isAuth,isAuthorMotor,isValidObjectId('/pages'),wrapAsync(MotorController.edit))
// 
module.exports= router;