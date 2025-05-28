const mongoose = require("mongoose");

const FaQSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    questionArabic: { type: String, default: "" },
    answer: { type: String, default: "" },
    answerArabic: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FaQ", FaQSchema);
