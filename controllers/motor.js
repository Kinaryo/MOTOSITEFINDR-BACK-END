const Motor = require('../models/motor')
const fs = require('fs')
const ExpressError = require('../utils/ErrorHandler')
module.exports.index = async(req,res)=>{
    const msg = req.flash('succes_msg','motor fetched successfully')
      const motors = await Motor.find()
      res.render('pages/index', {motors})
  }

  module.exports.post = (req,res)=>{
    res.render('pages/post')
}

module.exports.store = async(req,res,next)=>{
  const images = req.files.map(file =>({
      url : file.path,
      filename : file.filename,
  }))
    const motor = new Motor(req.body.motor)
    motor.author = req.user._id
    motor.images = images
    await motor.save()
    req.flash('success_msg','Selamat, anda berhasil menambahkan data')
    res.redirect('/pages')
    
}

module.exports.detail = async (req,res)=>{
    const {id} = req.params
    const motor = await Motor.findById(id)
    .populate({
      path : 'comments',
      populate:{
        path:'author'
      }
    })
    .populate('author')
console.log(motor)
    console.log(motor)
    res.render('pages/detail',{motor})

}

module.exports.edit = async(req,res)=>{
    
    const {id} = req.params
    const motor = await Motor.findById(id);
      res.render('pages/editForm', {motor})
  }

  module.exports.update = async(req,res)=>{
    const {id} = req.params
   const motor =  await Motor.findByIdAndUpdate(id,{...req.body.motor})

   if(req.files && req.files.length >0 ){
    
    motor.images.forEach(image =>{
      fs.unlink(image.url, err => new ExpressError(err))
    })
    
    
    const images = req.files.map(file =>({
      url : file.path,
      filename: file.filename
    }));

    motor.images = images;
    await motor.save();
   }
    req.flash('success_msg','Anda berhasil meng-update data')
    res.redirect('/pages')

}

module.exports.destroy = async(req,res)=>{
  const {id} = req.params
  const motor =  await Motor.findById(id)

  if(motor.images.length >0 ){
    
    motor.images.forEach(image =>{
      fs.unlink(image.url, err => new ExpressError(err))
    })
    
    
   }
   await motor.deleteOne();
   
   req.flash('success_msg','Data berhasil dihapus')
    res.redirect('/pages')
}