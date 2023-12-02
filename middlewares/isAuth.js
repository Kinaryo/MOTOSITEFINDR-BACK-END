module.exports = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error_msg', 'Maaf! anda belum login')
        return res.redirect('/login')
    }
    next();
}
