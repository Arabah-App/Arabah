const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      default: "",
    },
    categoryNameArabic: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    // location: {
    //   type: {
    //     type: String,
    //     enum: ["Point"],
    //     default: "Point",
    //   },
    //   locationName: { type: String, default: "" },
    //   coordinates: {
    //     type: [Number], // [longitude, latitude]
    //     required: true,
    //     default: null,
    //   },
    // },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1, //  1 for  Active , 0 for Inactivebvn b
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);
// activitySchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("Category", activitySchema);
