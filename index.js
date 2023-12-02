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
const { commentSchema } = require('./schemas/comment'); // Fixed import path

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Server route/landing page
app.get('/', (req, res) => {
    res.send('Server Motositefinder');
});

// Halaman home
app.get('/home', (req, res) => {
    res.send('home');
});

app.use('/motors',require('./routes/motor'))

const validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        console.log(error);
        return next(new ErrorHandler(msg, 400));
    } else {
        next();
    }
};

// Routes komentar
app.post('/motors/:id/comments', validateComment, wrapAsync(async (req, res) => {
    const comment = new Comment(req.body.comment);
    const motor = await Motor.findById(req.params.id);
    motor.comments.push(comment);
    await comment.save();
    await motor.save();
    res.json({ message: 'Success add comment', motor });
}));
//  routes hapus komentar 
app.delete('/motors/:motor_id/comments/:comment_id', wrapAsync(async (req, res) => {
    const { motor_id, comment_id } = req.params;
    await Motor.findByIdAndUpdate(motor_id, { $pull: { comments: { _id: comment_id } } });
    await Comment.findByIdAndDelete(comment_id);
    res.json({message: `Success Delete Comment`, motor})
}));
app.all('*', (req, res, next) => {
    next(new ErrorHandler('Page not Found', 404));
});

// Middleware untuk menangani suatu error
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error', { err });
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening On Port ${PORT}`);
    });
});
