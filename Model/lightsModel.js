const mongoose = require("mongoose");

const lightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    categoryNames: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    BrandID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      default: null,
    },

   
    name: {
      type: String,
      default: "",
    },
    nameArabic: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    descriptionArabic: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },

    BarCode: {
      type: String,
      default: "",
    },
    productUnitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProdiuctUnit",
    },



    product: [
      {
        shopName: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
        price: {
          type: Number,
          default: 0,
        },
        Location: {
          type: String,
          default: "",
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
 

    updatedList: [
      {
        shopName: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Store",
        },
        price: {
          type: Number,
          default: 0,
        },

        date: {
          type: Date,
        
        },
      },
   
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("light", lightSchema);
