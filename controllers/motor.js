const Motor = require('../models/motor')

module.exports.index = async (req, res) => {
    const {id} = req.params
    const motors = await Motor.find(id)
    const msg = req.flash('succes_msg','motor fetched successfully')
     res.json({msg, motors });
  }

// search function 
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }
module.exports.search = async (req, res) => {
    let motors;

    // Handling search
    if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), 'gi');
      motors = await Motor.find({ title: searchRegex });
    } else {
      // Handling filter
      if (req.query.sortBy === 'terbaru') {
        motors = await Motor.find().sort({ dateTime: -1 });
      } else if (req.query.sortBy === 'terlama') {
        motors = await Motor.find().sort({ dateTime: 1 });
      } else {
        motors = await Motor.find();
      }
    }
  //   Mengirim data sebagai JSON
    res.json({ motors });
  }

module.exports.detail = async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findById(id)
    .populate({
      path : 'comments',
      populate:{
        path:'author'
      }
    })
    .populate('author')
console.log(motor)
    res.json({ motor });
}
// menuju halaman input data 
module.exports.form = (req, res) => {
    res.json({ message: 'Halaman new post' });
};

module.exports.store = async (req, res) => {
    const motor = new Motor(req.body.motor);
    motor.author = req.user._id;
    await motor.save();
    req.flash('success_msg','Selamat, anda berhasil menambahkan data')
    res.json({ message: 'Motor added successfully', motor });
}
// menuju halaman edit 
module.exports.edit = async (req, res) => {
    const motor = await Motor.findById(req.params.id);
    res.json({ message: 'Halaman edit', motor });
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const motor = await Motor.findByIdAndUpdate(id, { ...req.body.motor });
    req.flash('success_msg','Anda berhasil meng-update data');
    res.json({ message: 'Motor updated successfully', motor });
}

module.exports.destroy = async (req, res) => {
    await Motor.findByIdAndDelete(req.params.id);
    const msg = req.flash('success_msg','Data berhasil dihapus');
    res.json({ message: 'Motor deleted successfully' });
}