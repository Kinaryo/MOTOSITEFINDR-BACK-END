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

app.get('/', (req, res) => {
    res.send('berhasil MotositeFindr');
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

app.get('/pages', wrapAsync(async (req, res) => {
    let motors;

    if (req.query.search) {
        const searchRegex = new RegExp(escapeRegex(req.query.search), 'gi');
        motors = await Motor.find({ title: { $regex: searchRegex, $options: 'i' } });
    } else {
        if (req.query.sortBy === 'terbaru') {
            motors = await Motor.find().sort({ dateTime: -1 });
        } else if (req.query.sortBy === 'terlama') {
            motors = await Motor.find().sort({ dateTime: 1 });
        } else {
            motors = await Motor.find();
        }
    }

    res.render('pages/index', { motors });
}));

app.get('/pages', wrapAsync(async (req, res) => {
    const motors = await Motor.find();
    res.render('pages/index', { motors });
}));

app.get('/pages/post', (req, res) => {
    res.render('pages/post');
});

app.post('/pages', validateMotor, wrapAsync(async (req, res, next) => {
    const motor = new Motor(req.body.motor);
    await motor.save();
    res.redirect('/pages');
}));

app.get('/pages/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findById(id);
    res.render('pages/detail', { motor });
}));

app.get('/pages/:id/editForm', wrapAsync(async (req, res) => {
    const motor = await Motor.findById(req.params.id);
    res.render('pages/editForm', { motor });
}));

app.put('/pages/:id', validateMotor, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findByIdAndUpdate(id, { ...req.body.motor });
    res.redirect('/pages');
}));

app.delete('/pages/:id', wrapAsync(async (req, res) => {
    await Motor.findByIdAndDelete(req.params.id);
    res.redirect('/pages');
}));

app.post('/pages/:id/comments', wrapAsync(async (req, res) => {
    const comment = new Comment(req.body.comment);
    const motor = await Motor.findById(req.params.id);
    motor.comments.push(comment);
    await comment.save();
    await motor.save();
    res.redirect(`/pages/${req.params.id}`);
}));

app.all('*', (req, res, next) => {
    next(new ErrorHandler('Page not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Oh no, something went wrong" } = err;
    res.status(statusCode).render('error', { err: { message } });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening On Port ${PORT}`);
    });
});
