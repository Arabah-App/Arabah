const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "light",
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", LikeSchema);
