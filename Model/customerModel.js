const mongoose = require("mongoose");


const customerSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    temMemberId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "teamMember"
    }],
    name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    countryCode: {
        type: String,
        default: ""
    },
    phoneNumber: {
        type: Number,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    }
},
    { timestamps: true }
)
module.exports = mongoose.model("customer", customerSchema);