const mongoose = require("mongoose");

const socketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    socketId: { type: String, default: "" },
    status: { type: Number, default: 0 }, //  0 = Offline, 1 = Online
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("socketUser", socketSchema);
