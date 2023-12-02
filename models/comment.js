const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    body: String,
    dateTime: {
        type: Date,
        default: Date.now,
    }
});

// Menambahkan metode untuk mendapatkan tanggal format singkat
commentSchema.methods.getShortFormattedDate = function() {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    return this.dateTime.toLocaleDateString('en-US', options);
};

module.exports = mongoose.model('Comment', commentSchema);