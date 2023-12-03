const mongoose = require('mongoose')
const Comment = require("./comment")
const Schema = mongoose.Schema;


const motorSchema = new Schema ({
    title: String,
    licensePlate: String,
    model:String,
    description: String,
    // dateTime: {
    //     type: Date, // Pastikan tipe datanya adalah Date
    //     default: Date.now,
    //   },
    image: String,
    author : {
      type: Schema.Types.ObjectId,
      ref: 'User',
  },
    comments:[{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }]

})

motorSchema.post(`findOneAndDelete`, async function(doc) {
  if(doc){
    await Comment.deleteMany({_id:{$in:doc.comments}})
  }
})


module.exports = mongoose.model ('Motor',motorSchema)
