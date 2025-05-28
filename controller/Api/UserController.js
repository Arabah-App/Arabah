const Model = require("../../Model/Index");
const helpers = require("../../utility/helpers");
const bcrypt = require("bcrypt");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const { Validator } = require("node-input-validator");
const helper = require("../../utility/helper");
const axios = require("axios");
const secret =
  "2bfdb99389a53941f85307af2ea2651a6c97ee33cef1bf69107ff9cee70016c0";

module.exports = {
  // Signup: async (req, res) => {
  //   try {
  //     const v = new Validator(req.body, {
  //       phone: "required",
  //     });
  //     let errorsResponse = await helpers.checkValidation(v);
  //     if (errorsResponse) {
  //       return helpers.error(res, errorsResponse);
  //     }
  //     var generateRandomOTP = 1111;
  //     var randomOtp = generateRandomOTP;

  //     const countryCode = req.body.countryCode;
  //     const phone = req.body.phone;
  //     const concatenatedValue = countryCode + phone;

  //     let user = await Model.UserModel.findOne({
  //       phoneNnumberWithCode: concatenatedValue,
  //     });

  //     if (user) {
  //       let upadte_data = await Model.UserModel.findByIdAndUpdate(
  //         { _id: user._id },
  //         { otp: randomOtp },
  //         { otpVerify: 0 }
  //       );
  //     } else {
  //       user = await Model.UserModel.create({
  //         phone: phone,
  //         countryCode: countryCode,
  //         phoneNnumberWithCode: concatenatedValue,
  //         otp: randomOtp,

  //         otpVerify: 0,
  //       });
  //     }

  //     return helpers.success(res,"", { otp: randomOtp });
  //   } catch (error) {
  //     console.log(error);
  //     return helpers.failed(res, "Internal server error");
  //   }
  // },
  Signup: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        phone: "required",
        countryCode: "required",
      });
      let errorsResponse = await helpers.checkValidation(v);
      if (errorsResponse) {
        return helpers.error(res, errorsResponse);
      }

      const countryCode = req.body.countryCode;
      const phone = req.body.phone;
      const concatenatedValue = countryCode + phone;

      let user = await Model.UserModel.findOne({
        phoneNnumberWithCode: concatenatedValue,
      });

      if (!user) {
        user = await Model.UserModel.create({
          phone: phone,
          countryCode: countryCode,
          phoneNnumberWithCode: concatenatedValue,
          otpVerify: 0,
        });
      }

      // ============ Send OTP via Authentica API ============
      const fullPhone = `${countryCode}${phone}`;
      console.log(fullPhone, "fullPhonefullPhone");
      const apiResponse = await axios.post(
        "https://api.authentica.sa/api/v1/send-otp",
        {
          phone: fullPhone,
          sender_name: "",
          method: "sms",
          number_of_digits: 4,
          otp_format: "numeric",
          is_fallback_on: 0,

        },
        {
          headers: {
            Accept: "application/json",
            "X-Authorization":
              "$2y$10$zqOOkZwoT/3ZhNoJ7zlDwumsoABHNDFeS1R5YEuElab.U9FQ1XV6m",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("OTP sent via WhatsApp:", apiResponse.data);

      return helpers.success(res, "OTP sent successfully");
    } catch (error) {
      console.log(error);
      return helpers.failed(res, "Internal server error");
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { phoneNnumberWithCode, otp, deviceToken, deviceType } = req.body;

      // Validate phone number
      if (!phoneNnumberWithCode) {
        let message = "Phone number is required";
        if (req.headers.language_type == "ar") {
          message = "رقم الهاتف مطلوب";
        }
        return helpers.failed(res, message);
      }

      // Fetch user from the database
      let user = await Model.UserModel.findOne({
        phoneNnumberWithCode: phoneNnumberWithCode,
      });

      // If user doesn't exist, return an error
      if (!user) {
        let message = "Invalid phone number";
        if (req.headers.language_type == "ar") {
          message = "رقم الهاتف غير صالح";
        }
        return helpers.failed(res, message);
      }

      const fullPhone = user.phoneNnumberWithCode;
      console.log("Sending OTP Verification Request to Authentica:", {
        phone: fullPhone,
        otp: otp,
      });
      console.log(typeof fullPhone, "SDSdsdsd");

      const authenticaResponse = await axios.post(
        "https://api.authentica.sa/api/v1/verify-otp",
        {
          phone: fullPhone,
          otp: otp,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Authorization":
              "$2y$10$zqOOkZwoT/3ZhNoJ7zlDwumsoABHNDFeS1R5YEuElab.U9FQ1XV6m",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Authentica API Response:", authenticaResponse.data);

      if (authenticaResponse.data.status === true) {
        const updatedUser = await Model.UserModel.findByIdAndUpdate(
          user._id,
          {
            otpVerify: 1,
            isProfileComplete: 1,
            loginTime: Math.floor(Date.now() / 1000),
            deviceToken: deviceToken,
            deviceType: deviceType,
          },
          { new: true }
        );

        if (!updatedUser) {
          let message = "Failed to update user";
          if (req.headers.language_type == "ar") {
            message = "فشل تحديث المستخدم";
          }
          return helpers.failed(res, message);
        }

        const token = jwt.sign(
          {
            _id: updatedUser._id,
            email: updatedUser.email,
            phoneNnumberWithCode: updatedUser.phoneNnumberWithCode,
            loginTime: updatedUser.loginTime,
          },
          secret
        );

        let userData = updatedUser.toJSON();
        userData.token = token;
        userData.countryCode = user.countryCode;

        let message = "OTP verified successfully";
        if (req.headers.language_type == "ar") {
          message = "تم التحقق من كلمة المرور لمرة واحدة";
        }
        return helpers.success(res, message, userData);
      } else {
        let message = `OTP verification failed: ${authenticaResponse.data.message}`;
        if (req.headers.language_type == "ar") {
          message = `فشل التحقق من كلمة المرور: ${authenticaResponse.data.message}`;
        }
        return helpers.failed(res, message);
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );

      let message = "Internal server error";
      if (req.headers.language_type == "ar") {
        message = "خطأ في الخادم الداخلي";
      }
      return helpers.failed(res, message);
    }
  },

  // verifyOtp: async (req, res) => {
  //   try {
  //     const { phoneNnumberWithCode, otp, deviceToken, deviceType } = req.body;

  //     if (!phoneNnumberWithCode) {
  //       let message = "Phone number  is required";
  //       if (req.headers.language_type == "ar") {
  //         message = "رقم الهاتف مطلوب";
  //       }
  //       return helpers.failed(res, message);
  //     }

  //     let user;

  //     if (phoneNnumberWithCode) {
  //       user = await Model.UserModel.findOne({
  //         phoneNnumberWithCode: phoneNnumberWithCode,
  //       });
  //       if (!user) {
  //         let message = "Invalid phone number";
  //         if (req.headers.language_type == "ar") {
  //           message = "رقم الهاتف غير صالح";
  //         }
  //         return helpers.failed(res, message);
  //       } else {
  //         if (user.otp == otp) {
  //           const updatedUser = await Model.UserModel.findByIdAndUpdate(
  //             user._id,
  //             {
  //               otp: 0,
  //               otpVerify: 1,
  //               isProfileComplete: 1,
  //               loginTime: Math.floor(Date.now() / 1000),
  //               deviceToken: deviceToken,
  //               deviceType: deviceType,
  //             },
  //             { new: true }
  //           );

  //           if (!updatedUser) {
  //             let message = "Failed to update user";
  //             if (req.headers.language_type == "ar") {
  //               message = "فشل تحديث المستخدم";
  //             }
  //             return helpers.failed(res, message);
  //           }
  //           const updatedUser1 = await Model.UserModel.findOne(user._id);

  //           const token = jwt.sign(
  //             {
  //               _id: updatedUser1._id,
  //               email: updatedUser1.email,
  //               phoneNnumberWithCode: updatedUser1.phoneNnumberWithCode,
  //               loginTime: updatedUser1.loginTime,
  //             },
  //             secret
  //           );

  //           let userData = updatedUser1.toJSON();
  //           userData.token = token;
  //           userData.countryCode = user.countryCode;

  //           let message = "OTP verified";
  //           if (req.headers.language_type == "ar") {
  //             message = "تم التحقق من كلمة المرور لمرة واحدة";
  //           }
  //           return helpers.success(res, message, userData);
  //         } else {
  //           let message = "Please enter valid OTP";
  //           if (req.headers.language_type == "ar") {
  //             message = "الرجاء إدخال كلمة مرور صالحة";
  //           }
  //           return helpers.failed(res, message);
  //         }
  //       }
  //     }
  //     if (user.status === 1) {
  //       let message = "This account has been deactivated, please contact Admin";
  //       if (req.headers.language_type == "ar") {
  //         message = "لقد تم تعطيل هذا الحساب، يرجى الاتصال بالمسؤول";
  //       }
  //       return helpers.failed(res, message);
  //     }
  //   } catch (error) {
  //     console.log(error, "error");

  //     let message = "Internal server error";
  //     if (req.headers.language_type == "ar") {
  //       message = "خطأ في الخادم الداخلي";
  //     }
  //     return helpers.failed(res, AppMESSAGE);
  //   }
  // },
  resent_otp: async (req, res) => {
    try {
      const { phonenumber } = req.body;
  

      let user;
      if (!phonenumber) {
        let message = "Phone number is required";
        if (req.headers.language_type === "ar") {
          message = "رقم الهاتف مطلوب";
        }
        throw new Error(message);
      }

      // Find user by phone number
      user = await Model.UserModel.findOne({
        phoneNnumberWithCode: phonenumber,
      });
  
      if (!user) {
        let message = "Invalid phone number";
        if (req.headers.language_type === "ar") {
          message = "رقم الهاتف غير صالح";
        }
        throw new Error(message);
      }

      // Generate and send OTP using the external API
      const fullPhone = phonenumber;
      console.log(fullPhone, "fullPhone");

      const apiResponse = await axios.post(
        "https://api.authentica.sa/api/v1/send-otp",
        {
          phone: fullPhone,
          method: "sms",
          number_of_digits: 4,
          otp_format: "numeric",
          is_fallback_on: 0,
        },
        {
          headers: {
            Accept: "application/json",
            "X-Authorization":
              "$2y$10$zqOOkZwoT/3ZhNoJ7zlDwumsoABHNDFeS1R5YEuElab.U9FQ1XV6m",
            "Content-Type": "application/json",
          },
        }
      );

      // Update OTP in the user model
      const updatedUser = await Model.UserModel.findOneAndUpdate(
        { _id: user._id },
        { otpVerify: 0 }, // Ensure otpVerify is reset
        { new: true }
      );

      if (!updatedUser) {
        let message = "Failed to resend OTP";
        if (req.headers.language_type === "ar") {
          message = "فشلت إعادة إرسال كلمة المرور لمرة واحدة";
        }
        throw new Error(message);
      }

      // Check if OTP was successfully sent
      if (apiResponse.data && apiResponse.data.success) {
        let message = "OTP resent successfully";
        if (req.headers.language_type === "ar") {
          message = "تم إعادة إرسال كلمة المرور لمرة واحدة بنجاح";
        }
        return helpers.success(res, message, updatedUser);
      } else {
        throw new Error("Failed to send OTP via external service");
      }
    } catch (error) {
      return helpers.error(res, error.message || error);
    }
  },

  // resent_otp: async (req, res) => {
  //   try {
  //     const { phonenumber } = req.body;
  //     let user;

  //     if (phonenumber) {
  //       // Find the user by phone number
  //       user = await Model.UserModel.findOne({
  //         phoneNnumberWithCode: phonenumber,
  //       });
  //       if (!user) {
  //         let message = "Invalid phone number";
  //         if (req.headers.language_type == "ar") {
  //           message = "رقم الهاتف غير صالح";
  //         }
  //         throw message;
  //       }
  //     } else {
  //       let message = "Phone number is required";
  //       if (req.headers.language_type == "ar") {
  //         message = "رقم الهاتف مطلوب";
  //       }

  //       throw message;
  //     }

  //     let otp = 1111;

  //     let updatedUser = await Model.UserModel.findOneAndUpdate(
  //       { _id: user._id },
  //       { otp: otp },
  //       { otpVerify: 0 },

  //       { new: true }
  //     );

  //     if (!updatedUser) {
  //       let message = "Failed to resend OTP";
  //       if (req.headers.language_type == "ar") {
  //         message = "فشلت إعادة إرسال كلمة المرور لمرة واحدة";
  //       }
  //       throw message;
  //     }

  //     let message = "OTP resent successfully";
  //     if (req.headers.language_type == "ar") {
  //       message = "تم إعادة إرسال كلمة المرور لمرة واحدة بنجاح";
  //     }
  //     return helpers.success(res, message, updatedUser);
  //   } catch (error) {
  //     return helpers.error(res, error);
  //   }
  // },
  CompleteProfile: async (req, res) => {
    try {
      if (req.files && req.files.image) {
        const image = req.files.image;
        if (image) {
          req.body.image = helpers.imageUpload(image, "images");
        }
      }
      const { title_1, title_2 } = await helper.translateText(req.body.name);

      let userInfo = await Model.UserModel.findByIdAndUpdate(
        { _id: req.user._id },
        {
          name: title_1,
          nameArabic: title_2,
          email: req.body.email,

          image: req.body.image,
        },
        { new: true }
      );

      if (userInfo) {
        let message = "Updated Profile successfully";
        if (req.headers.language_type == "ar") {
          message = "إكمال الملف الشخصي بنجاح";
        }
        return helpers.success(res, message, userInfo);
      } else {
        let AppMESSAGE;

        AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "User not found"
        );
        return helpers.failed(res, AppMESSAGE);
      }
    } catch (error) {
      console.log(error);
    }
  },
  logOut: async (req, res) => {
    try {
      await Model.UserModel.findByIdAndUpdate(
        { _id: req.user._id },
        { loginTime: 0 },
        { new: true }
      );
      let message = "User logOut successfully";
      if (req.headers.language_type == "ar") {
        message = "تم تسجيل خروج المستخدم بنجاح";
      }

      return helpers.success(res, message);
    } catch (error) {
      console.log(error);
      return helpers.error(res, error);
    }
  },
  DeleteAccount: async (req, res) => {
    try {
      let DeleteAccount = await Model.UserModel.findByIdAndDelete(
        {
          _id: req.user._id,
        },
        {
          new: true,
        }
      );
      if (!DeleteAccount) {
        let message = "please login first";
        if (req.headers.language_type == "ar") {
          message = "تم تسجيل خروج المستخدم بنجاح";
        }

        return helpers.failed(res, message);
      }

      let message = "Account Deleted SuccessFully";
      if (req.headers.language_type == "ar") {
        message = "تم حذف الحساب بنجاح";
      }

      return helpers.success(res, message, DeleteAccount);
    } catch (error) {
      console.log(error, "Something Went Wrong");
    }
  },
  Get_profile: async (req, res) => {
    try {
      let Get_profile = await Model.UserModel.findOne({
        _id: req.user._id,
      });
      if (!Get_profile) {
        let AppMESSAGE;

        AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "Profile Get"
        );
        return helpers.failed(res, AppMESSAGE);
      }
      let AppMESSAGE;

      AppMESSAGE = await helper.lang(req.headers.language_type, "Profile Get");
      return helpers.success(res, AppMESSAGE, Get_profile);
    } catch (error) {
      console.log(error, "Something Went Wrong");
    }
  },

  changeLanguage: async (req, res) => {
    try {
      let Product = await Model.UserModel.findByIdAndUpdate(
        req.user._id,
        {
          language_type: req.body.language_type,
        },
        { new: true }
      );
      if (Product) {
        let AppMESSAGE;

        AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "language change "
        );
        return helper.success(res, AppMESSAGE, Product);
      }
    } catch (error) {
      console.log(error, "Something went wromg");
    }
  },
};
