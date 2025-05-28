const mongoose = require("mongoose");

const ShoppingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "light",
    },

    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shopping", ShoppingSchema);
