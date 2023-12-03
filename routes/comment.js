const express = require('express');
const wrapAsync = require('../utils/wrapAsync')
const isValidObjectId = require('../middlewares/isValidObjectId')
const ErrorHandler = require('../utils/ErrorHandler')
const isAuth = require('../middlewares/isAuth')

//modelss
const Motor = require('../models/motor')
const Comment = require('../models/comment')
// schemas 
const {commentSchema} = require('../schemas/comment')

const router = express.Router({mergeParams : true});

const validateComment = (req,res,next)=>{
    const {error} = commentSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        console.log(error)
        return next(new ErrorHandler(error.details[0].message,400))
    }else{
        next()
    }
}

//bagian komentar
router.post('/',isAuth, isValidObjectId('/motors'),validateComment, wrapAsync(async (req, res) => {
    const comment = new Comment(req.body.comment);
    const motor = await Motor.findById(req.params.id);
    motor.comments.push(comment);
    await comment.save();
    await motor.save();
    const msg = req.flash('success_msg','anda berhasil menambahkan komentar')
    res.json({ message: 'Success add comment', motor });
}));

// menghapus komentar 
router.delete('/motors/:motor_id/comments/:comment_id', isAuth,isValidObjectId('/motors'),wrapAsync(async (req, res) => {
    const { motor_id, comment_id } = req.params;
    await Motor.findByIdAndUpdate(motor_id, { $pull: { comments: { _id: comment_id } } });
    await Comment.findByIdAndDelete(comment_id);
    const msg = req.flash('success_msg','comment berhasil dihapus')
    res.json({message: `Success Delete Comment`, motor})
}));

module.exports= router;