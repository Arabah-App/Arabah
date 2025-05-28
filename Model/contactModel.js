const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    message: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    status: {
        type: Number,
        enum: [0, 1],
        default: 0, //  1 for  Active user, 0 for Inactive
      },
    deleted: { type: Boolean, default: false },
},
    { timestamps: true }
);

module.exports = mongoose.model('contactUs', contactSchema);
