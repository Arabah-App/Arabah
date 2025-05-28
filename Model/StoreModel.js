const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    nameArabic: { type: String, default: "" },


    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Store", StoreSchema);
