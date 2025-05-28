const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    Brandname: {
      type: String,
      default: "",
    },
    BrandnameArabic: {
      type: String,
      default: "",
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Brand", BrandSchema);












