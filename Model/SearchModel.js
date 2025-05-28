const mongoose = require("mongoose");

const SearchSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, default: "" },
    nameArabic: { type: String, default: "" },
  
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Search", SearchSchema);
