const mongoose = require("mongoose");

const DealSchema = new mongoose.Schema(
  {
    StoreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
    image: {
      type: String,
      default: "",
    },
    Decription: {
      type: String,
      default: "",
    },
    DecriptionArabic: {
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

module.exports = mongoose.model("Deal", DealSchema);
