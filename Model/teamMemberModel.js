const mongoose = require("mongoose");

const teamMemberSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    customerId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        default: null
    }],
    name: {
        type: String,
        default: ""
    },

    email: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    password: {
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
module.exports = mongoose.model("teamMember", teamMemberSchema);