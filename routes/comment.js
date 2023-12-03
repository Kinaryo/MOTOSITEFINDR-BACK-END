const express = require('express');
const wrapAsync = require('../utils/wrapAsync')
const controllersComment = require('../controllers/comment')
const isValidObjectId = require('../middlewares/isValidObjectId')
const ErrorHandler = require('../utils/ErrorHandler')
const isAuth = require('../middlewares/isAuth')
const {isAuthorComment} = require('../middlewares/isAuthor')
const {validateComment} = require('../middlewares/validator')
//modelss
const Motor = require('../models/motor')
const Comment = require('../models/comment')
// schemas 
const {commentSchema} = require('../schemas/comment')

const router = express.Router({mergeParams : true});

//bagian komentar
router.post('/',isAuth, isValidObjectId('/motors'),validateComment, wrapAsync(controllersComment.store));
// menghapus komentar 
router.delete('/motors/:motor_id/comments/:comment_id', isAuth,isAuthorComment,isValidObjectId('/motors'),wrapAsync(controllersComment.destroy));

module.exports= router;