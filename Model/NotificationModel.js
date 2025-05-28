const mongoose = require("mongoose");

const NotifationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ReciverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: "",
    },
    ProductID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "light",
    },
    image: { type: String, default: "" },
    message: { type: String },
    message_Arabic: { type: String },
    description: { type: String },
    description_Arabic: { type: String },
    NotificationRead: { type: Number, default: 0 },

    type: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notifications", NotifationSchema);
