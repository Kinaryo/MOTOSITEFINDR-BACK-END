const Motor = require ("../models/motor")
const Comment = require("../models/comment")

module.exports.isAuthorMotor = async(req,res,next)=>{
    const {id} = req.params

    let motor = await Motor.findById(id);
    
    if (!motor.author.equals(req.user._id)){
      req.flash('error_msg', 'Not authorized');
      return (res.redirect('/pages'))
    }
    next();
}
module.exports.isAuthorComment = async(req,res,next)=>{
    const {motor_id,comment_id} = req.params

    let comment = await Comment.findById(comment_id);
    
    if (!comment.author.equals(req.user._id)){
      req.flash('error_msg', 'Not authorized');
      return (res.redirect(`/pages/${motor_id}`))
    }
    next();
}