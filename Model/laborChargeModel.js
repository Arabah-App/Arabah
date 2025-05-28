const mongoose = require('mongoose');

const laborcharge = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    laberCharge: { type: String },
},
    { timestamps: true });

module.exports = mongoose.model('laborcharge', laborcharge); 
