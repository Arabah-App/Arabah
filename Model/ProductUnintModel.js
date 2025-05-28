const mongoose = require("mongoose");

const ProdiuctUnitSchema = new mongoose.Schema(
  {
    ProdiuctUnit: {
      type: String,
      default: "",
    },
    ProdiuctUnitArabic: {
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

module.exports = mongoose.model("ProdiuctUnit", ProdiuctUnitSchema);












