const { string } = require("joi");
const mongoose = require("mongoose");

const NotesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
 
    notesText: [
      {
        text: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Number,
          default: () => Math.floor(Date.now() / 1000),
        },
      },
    ],
  }, 
  { timestamps: true }
);
const Notes = mongoose.model("Notes", NotesSchema);

module.exports = Notes;
