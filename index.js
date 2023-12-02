const ejsMate = require('ejs-mate')
require('dotenv').config();
const express = require('express');
const ErrorHandler = require('./utils/ErrorHandler')
const Joi = require('joi')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const path = require ('path')
const app = express();
const wrapAsync = require('./utils/wrapAsync')


const PORT = process.env.PORT || 3000;


mongoose.set('strictQuery', false);
const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`)

    }catch(error){
        console.log(error)
        process.exit(1)

    }
}

// models
const Motor = require('./models/motor')
const Comment = require('./models/comment')

// schemas 
const {motorSchema} = require('./schemas/motor')

// connect to mngodb
// mongoose.connect('mongodb://127.0.0.1/motositefinder')
// .then((result)=>{
//     console.log('connected to mongodb')
// }).catch((err)=>{
//     console.log(err)
// })

app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

// middleware untuk mendapatkan data dari body 
app.use(express.urlencoded({extended:true}));
// mengubahmethod post menjadi method yang akan di pakai melalui query 
app.use(methodOverride('_method'))

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

app.get('/',(req,res)=>{
    res.send('berhasil')

})

// searching and filtering
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
  
  app.get('/pages', wrapAsync(async (req, res) => {
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




app.get('/pages', wrapAsync(async(req,res)=>{
    const motors = await Motor.find()
    res.render('pages/index', {motors})
}))

// create/form 
app.get('/pages/post', (req,res)=>{
    res.render('pages/post')
})

// submit post
app.post('/pages', validateMotor, wrapAsync(async(req,res,next)=>{
    const motor = new Motor(req.body.motor)
    await motor.save()
    res.redirect('/pages')
    
}))

// details
app.get('/pages/:id', wrapAsync(async (req,res)=>{
    const {id} = req.params
    const motor = await Motor.findById(id)
    res.render('pages/detail',{motor})

}))

// menuju ke halaman edit 
app.get('/pages/:id/editForm',wrapAsync(async(req,res)=>{
    const motor = await Motor.findById(req.params.id);
    res.render('pages/editForm', {motor})
}))
// mengirim dari halaman edit
app.put('/pages/:id',validateMotor,wrapAsync(async(req,res)=>{
    const {id} = req.params
    const motor = await Motor.findByIdAndUpdate(id,{...req.body.motor})
    res.redirect('/pages')

}))

// delete motor 
app.delete('/pages/:id',wrapAsync(async(req,res)=>{
    await Motor.findByIdAndDelete(req.params.id)
    res.redirect('/pages')
}))

//bagian komentar
app.post('/pages/:id/comments', wrapAsync(async( req,res)=>{
    const comment = new Comment(req.body.comment);
    const motor = await Motor.findById(req.params.id);
    motor.comments.push(comment);
    await comment.save();
    await motor.save()
    res.redirect(`/pages/${req.params.id}`)

}))



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
// app.listen(5000,()=>{
//     console.log(`server is running on http://127.0.0.1:5000`)
// })

connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Listening On Port ${PORT}`)
    })
})
