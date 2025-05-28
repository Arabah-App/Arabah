const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: Number,
      enum: [0, 1],
      default: 1, // 0 for Admin, 1 for user
    },

    name: {
      type: String,
      default: "",
    },
    nameArabic: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },
    phoneNnumberWithCode: {
      type: String,
      default: "",
    },

   
    image: {
      type: String,
      default: "",
    },

    countryCode: {
      type: String,
      default: "",
    },

    language_type: {
      type: String,
      default: "",
    },

    status: {
      type: Number,
      enum: [1, 2],
      default: 1, //  1 for  Active user, 2 for Inactive
    },

    authToken: {
      type: String,
      default: "",
    },

    deviceToken: {
      type: String,
      default: "",
    },

    deviceType: {
      type: Number,
      enum: [1, 2], //1 for Android, 2 for IOS
      default: null,
    },

    IsNotification: {
      type: Number,
      default: 1, //0 is on and 1 is off
    },
    Notifyme: {
      type: Number,
      default: 0, //0 is on and 1 is off
    },
    loginTime: {
      type: Number,
    },
    socialtype: {
      type: Number,
      enum: [0, 1], // 0 for facebook 1 for google
      default: null,
    },
    otp: {
      type: Number,
    },
    otpVerify: {
      type: Number,
      enum: [0, 1],
      default: 0, // 1 verify 0 unverify
    },
    isProfileComplete: {
      type: Number,
      enum: [0, 1], //0 user Profile not complete ,  1 user profile complete,
      default: 0,
    },
    forgotPasswordToken: {
      type: String,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.index({ "Location.coordinates": "2dsphere" });

module.exports = mongoose.model("User", userSchema);
