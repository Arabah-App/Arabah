const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "light",
    },
    message: { type: String, default: "" },
    status: {
      type: Number,
      enum: [0, 1],
      default: 0, //  1 for  Active user, 0 for Inactive
    },

    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
