const Comment = require('../models/comment')
const Motor = require('../models/motor')

module.exports.store = async( req,res)=>{
    const {motor_id} = req.params
    const comment = new Comment(req.body.comment);
    comment.author = req.user._id;
    await comment.save();

    const motor = await Motor.findById(motor_id);
    motor.comments.push(comment);
    await motor.save()
    req.flash('success_msg','anda  berhasil menambahkan komentar')
    res.redirect(`/pages/${motor_id}`)

}

module.exports.destroy = async (req, res) => {
    const { motor_id, comment_id } = req.params;
    await Motor.findByIdAndUpdate(motor_id, { $pull: { comments: { _id: comment_id } } });
    await Comment.findByIdAndDelete(comment_id);
    const msg = req.flash('success_msg','comment berhasil dihapus')
    res.redirect(`/pages/${motor_id}`);
}