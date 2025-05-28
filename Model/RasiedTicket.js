const mongoose = require("mongoose");

const RaisedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Title: {
      type: String,
      default: "",
    },
    TitleArabic: {
      type: String,
      default: "",
    },
    Description: {
      type: String,
      default: "",
    },
    DescriptionArabic: {
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

module.exports = mongoose.model("Raised", RaisedSchema);
