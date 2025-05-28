
const mongoose = require('mongoose')

const CmsSchema = new mongoose.Schema({
   type: {
      type: Number,
      enum: [1, 2, 3]  // 1 for aboutus, 2 for privacy policy, 3 for terms & conditions
   },
   title: {
      type: String,
      default: ''
   },
   description: {
      type: String,
      default: ''
   },
   descriptionArabic: {
      type: String,
      default: ''
   },
   // 1 for aboutus, 2 for privacy policy, 3 for terms & conditions
},
   { timestamps: true }
);

module.exports = mongoose.model('cms', CmsSchema);
