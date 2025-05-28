const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
        default: null
    },
    section: [{
        lightsId: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "light",
            default: null
        }],
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },
        // laborChargeId: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "laborcharge",
        //     default: null
        // },
        additionalField: mongoose.Schema.Types.Mixed,
        lightsCharge: {
            type: Number,
            default: null
        },
        laborCharge: {
            type: Number,
            default: null
        },
        total: {
            type: Number,
            default: null
        },
    }],
    description: {
        type: String,
        default: ""
    },
    invoiceNo: {
        type: String,
        default: ""
    },
    customerSince: {
        type: String,
        default: ""
    },
    BillDueNo: {
        type: String,
        default: ""
    },
    status: {
        type: Number,
        enum: [0, 1, 2], // 0 pending  1 for won 2 Lost
        default: 0
    },
    lightsCharge: {
        type: Number,
        default: null
    },
    laborCharge: {
        type: Number,
        // default: null
    },
    total: {
        type: Number,
        // default: null
    },
    image: [{
        type: String,
        default: ""
    }],
    sendEstimate: {
        type: Number,
        enum: [0, 1],  //0 iestimate 1 total
    },
}, { timestamps: true });

const InvoiceModel = mongoose.model('Invoice', invoiceSchema);

module.exports = InvoiceModel;
