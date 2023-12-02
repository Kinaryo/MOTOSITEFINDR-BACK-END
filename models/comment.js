const mongoose = require('mongoose')
const Schema = mongoose.Schema
const commentSchema = new Schema({
    body : String,
    dateTime: {
        type: Date, // Pastikan tipe datanya adalah Date
        default: Date.now,
      }

})

module.exports=mongoose.model('Comment',commentSchema)