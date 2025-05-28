const Notes = require("../../Model/notesModel");
const helpers = require("../../utility/helpers");
const mongoose = require("mongoose");
module.exports = {
  NotesCreate: async (req, res) => {
    try {
      const { texts, id } = req.body;

      if (!texts) {
        return helpers.failed(res, "Text field is required");
      }

      const newNotesText = [];

      JSON.parse(texts).forEach((text) => {
        try {
          const parsedNote = text;

          if (parsedNote.text) {
            newNotesText.push({ text: parsedNote.text });
          } else {
            return helpers.failed(res, "Each note must have a 'text' field");
          }
        } catch (error) {
          return helpers.failed(res, "Invalid note format");
        }
      });

      if (id) {
        const notes = await Notes.findOne({ userId: req.user._id, _id: id });

        if (!notes) {
          return helpers.failed(res, "Note with this ID not found");
        }

        notes.notesText = newNotesText;
        await notes.save();
        return helpers.success(res, "Notes Updated", notes);
      } else {
        const newNote = new Notes({
          userId: req.user._id,
          notesText: newNotesText,
        });

        await newNote.save();
        return helpers.success(res, "Notes Created", newNote);
      }
    } catch (error) {
      console.error("Error creating/updating notes:", error);
      return helpers.failed(res, "Internal server error");
    }
  },

  getNotes: async (req, res) => {
    try {
      const GetNotes = await Notes.find({ userId: req.user._id });

      if (GetNotes.length === 0) {
        return helpers.arraysuccess(res, "no data");
      }

      const modifiedNotes = GetNotes.map((note) => ({
        _id: note._id,
        userId: note.userId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        notesText: note.notesText.slice(0, 2).map((n) => ({
          text: n.text,
          createdAt: n.createdAt,
          _id: n._id,
          main_id: note._id,
        })),
      }));
      return helpers.success(res, "your data get", modifiedNotes);
    } catch (error) {
      console.log(error, "something went wrong");
      return helpers.error(res, "something went wrong");
    }
  },

  Notes: async (req, res) => {
    try {
      const GetNotes = await Notes.find({ userId: req.user._id });
      if (GetNotes.length === 0) {
        return helpers.success(res, "no data");
      }

      return helpers.success(res, "your data get", GetNotes);
    } catch (error) {
      console.log(error, "something went wrong");
      return helpers.error(res, "An error occurred");
    }
  },

  getNotesdetail: async (req, res) => {
    if (!req.query.id) {
      return helpers.success(res, "No ID provided, returning empty data", {});
    }

    try {
      const GetNotesdeatial = await Notes.findById({
        userId: req.user._id,
        _id: req.query.id,
      });
      console.log("🚀 ~ getNotesdetail: ~ GetNotesdeatial:", GetNotesdeatial);
      if (!GetNotesdeatial) {
        return helpers.failed(res, "no data ");
      }
      return helpers.success(res, "your data get", GetNotesdeatial);
    } catch (error) {
      console.log(error, "somthing went wrong");
    }
  },
  deleteNotes: async (req, res) => {
    try {
      const deleteNotes = await Notes.findOneAndDelete(
        {
          _id: req.body.id,
        },
        { new: true }
      );
      if (!deleteNotes) {
        return helpers.failed(res, "not delete");
      }
      return helpers.success(res, "you Note Delete");
    } catch (error) {
      console.log(error, "Somthing wnet wrong");
    }
  },
};
