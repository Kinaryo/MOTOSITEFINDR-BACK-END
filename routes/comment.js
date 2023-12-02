const express = require('express');
const ControllerComment = require('../controllers/comment')
const wrapAsync = require('../utils/wrapAsync')
const isValidObjectId = require('../middlewares/isValidObjectId')
const {validateComment} = require('../middlewares/validator')
const isAuth = require('../middlewares/isAuth')
const {isAuthorComment} = require('../middlewares/isAuthor')

//modelss
const Motor = require('../models/motor')
const Comment = require('../models/comment')
// schemas 
const {commentSchema} = require('../schemas/comment')

const router = express.Router({mergeParams : true});

//bagian komentar
router.post('/',isAuth,isValidObjectId('/pages'),validateComment, wrapAsync(ControllerComment.store))

// menghapus komentar 
router.delete('/:comment_id',isAuth,isAuthorComment,isValidObjectId('/pages'), wrapAsync(ControllerComment.destroy));

module.exports= router;