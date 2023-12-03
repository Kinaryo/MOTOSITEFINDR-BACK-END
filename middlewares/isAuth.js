module.exports = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash('error_msg', 'Maaf! anda belum login')
        res.redirect('/login')


    }
    next();
}