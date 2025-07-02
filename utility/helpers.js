const uuidv4 = require("uuid").v4;
const uuid = require("uuid").v4;

const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const UserModel = require("../Model/userModel");
const userModel = require("../Model/userModel");
const helper = require("../utility/helper")
const rateLimit = require('express-rate-limit');
const logger = require('./logger');
require("dotenv").config();
// const redis = require("../controller/Api/redis");

// Regular expression for validating UUIDs
const uuidRegex = /^[a-f\d]{8}(-[a-f\d]{4}){4}[a-f\d]{8}$/i;

// Mapping MIME types to file types
const supportedTypes = {
  "image/jpeg": "images",
  "image/png": "images",
  "application/pdf": "pdf",
  "application/msword": "docs",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docs",
  "audio/mpeg": "audio",
  "video/mp4": "video",
};

// Function to determine file type based on MIME type
const getFileType = function (mimeType) {
  return supportedTypes[mimeType] || null;
};

const failed = async function (res, message = "") {
  message =
    typeof message === "object"
      ? message.message
        ? message.message
        : ""
      : message;
  return res.status(200).json({
    success: false,
    code: 200,
    message: message,
    body: {},
  });
};
const secret = process.env.JWT_KEY;
// Exporting an object containing uploadFile function
module.exports = {

  cacheMiddleware: async (req, res, next) => {
    const key = req.originalUrl;
    try {
      const cachedData = await redis.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData)); // Return cached response
      }


      const originalJson = res.json;
      res.json = (body) => {
        redis.setex(key, 3600, JSON.stringify(body)); // Cache for 1 hour
        originalJson.call(res, body); // Call original `res.json`
      };

      next();
    } catch (error) {
      console.error("Redis Cache Error:", error);
      next();
    }
  },
  // Function to handle file uploads
  uploadFile: async function (req, res) {
    try {
      // Extracting uploaded files from request object
      const files = Array.isArray(req.files.file)
        ? req?.files?.file
        : [req?.files?.file];
      // Iterating over each file
      const uploadResults = await Promise.all(
        files.map(async function (file) {
          if (!file) {
            return {
              success: false,
              message: "No file uploaded",
            };
          }

          const fileType = getFileType(file.mimetype);
          if (!fileType) {
            return {
              success: false,
              message: "Invalid file type",
            };
          }
          // Creating upload directory if it doesn't exist
          const uploadDir = path.join(path.resolve(), "/public/", fileType);
          const isDirExist = fs.existsSync(uploadDir);
          if (!isDirExist) fs.mkdirSync(uploadDir);
          // Generating unique file name
          const fileNameUnic = uuidv4() + "-" + file.name;
          const fileBasePath = fileType + "/" + fileNameUnic;
          // Constructing file path
          const filePath = path.join(uploadDir, fileNameUnic);
          // Moving the file to the specified path
          await file.mv(filePath);
          return {
            success: true,
            fileUrl: process.env.BASE_URL + "/" + fileBasePath,
          };
        })
      );

      // Filtering successfully uploaded files and failed uploads
      const successUploads = uploadResults.filter(function (result) {
        return result.success;
      });
      const failedUploads = uploadResults.filter(function (result) {
        return !result.success;
      });

      // Responding with appropriate status and messages
      if (failedUploads.length > 0) {
        return res.status(400).send({
          message: "Some files failed to upload",
          success: false,
          failedUploads: failedUploads.map(function (upload) {
            return upload.message;
          }),
        });
      }

      return res.status(200).send({
        message: "All files uploaded successfully",
        success: true,
        uploadedFiles: successUploads.map(function (upload) {
          return upload.fileUrl;
        }),
      });
    } catch (error) {
      console.log(error);
      return failed(res, "Internal server error", error);
    }
  },
  imageUpload: (file, folder = "user") => {
    if (file.name == "") return;
    let file_name_string = file.name;
    var file_name_array = file_name_string.split(".");
    var file_extension = file_name_array[file_name_array.length - 1];
    var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    var result = "";
    result = uuid();
    let name = result + "." + file_extension;
    file.mv("public/" + folder + "/" + name, function (err) {
      if (err) throw err;
    });
    return "/" + folder + "/" + name;
  },
  catchServerError: async function (err, req, res, next) {
    try {
      if (err) {
        logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
        if (err.statusCode) {
          return res.status(err.statusCode).send(err);
        } else throw err;
      }
    } catch (err) {
      logger.error(`${req.method} ${req.originalUrl} - Internal server error: ${err.message}`);
      return res.status(501).send({
        statusCode: 501,
        message: "Internal server error",
      });
    }
  },
  TryCatchHanddler: function (fun) {
    return async function (req, res, next) {
      try {
        await fun(req, res, next);
      } catch (err) {
        console.error(err);
        const errorResponse = {
          message: err.message || "Internal server error",
          statusCode: err.statusCode || 500,
          body: {},
        };
        return res.status(errorResponse.statusCode).send(errorResponse);
      }
    };
  },
  dataValidator: function (validationSchema, data) {
    try {
      let validation = validationSchema.validate(data);
      if (validation.error) {
        let message = validation.error.details[0].message;
        message = message.split(" ");
        message[0] = message[0].split('"')[1];
        let erroeMessage = "";
        message.map(function (w) {
          erroeMessage += " " + w;
        });
        throw {
          message: erroeMessage.trim(),
          statusCode: 400,
        };
      }
      return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  failed: failed,
  AsyncHanddle: function (fn) {
    return async function (req, res, next) {
      try {
        await fn(req, res, next);
      } catch (err) {
        console.log("error: -", err);
        let errorMEssage = "";
        if (typeof err == "string") errorMEssage = err;
        if (typeof err == "object") errorMEssage = err;
        return failed(res, errorMEssage);
      }
    };
  },
  asyncMiddleware: async function (req, res, next) {
    try {
      const SECRET_KEY = req.headers["secret_key"];
      const PUBLISH_KEY = req.headers["publish_key"];
      if (
        process.env.SECRET_KEY === SECRET_KEY &&
        process.env.PUBLISH_KEY === PUBLISH_KEY
      ) {
        next();
      } else {
        return res.status(404).send({
          message: "key is not macth",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  checkValidation: async (v) => {
    var errorsResponse;

    await v.check().then(function (matched) {
      if (!matched) {
        var valdErrors = v.errors;
        var respErrors = [];
        Object.keys(valdErrors).forEach(function (key) {
          if (valdErrors && valdErrors[key] && valdErrors[key].message) {
            respErrors.push(valdErrors[key].message);
          }
        });
        errorsResponse = respErrors.join(", ");
      }
    });
    return errorsResponse;
  },
  failed: (res, message = "") => {
    message =
      typeof message === "object"
        ? message.message
          ? message.message
          : ""
        : message;
    return res.status(400).json({
      success: false,
      code: 400,
      message: message,
      body: {},
    });
  },
  success: (res, message = "", body = {}) => {
    return res.status(200).json({
      success: true,
      code: 200,
      message: message,
      body: body,
    });
    node;
  },
  arraysuccess: (res, message = "", body = []) => {
    return res.status(200).json({
      success: true,
      code: 200,
      message: message,
      body: body,
    });
    node;
  },
  async fileUpload(files, folder = "users") {
    const file_name_string = files.name;
    const file_name_array = file_name_string.split(".");
    const file_ext = file_name_array[file_name_array.length - 1];

    const letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    let result = "";

    while (result.length < 28) {
      const rand_int = Math.floor(Math.random() * 19 + 1);
      const rand_chr = letters[rand_int];
      if (result.substr(-1, 1) !== rand_chr) result += rand_chr;
    }

    const resultExt = `${result}.${file_ext}`;

    console.log("🚀 ~ file: file.js:2--1 ~ fileUpload ~ resultExt:", resultExt);
    await files.mv(`public/images/${folder}/${resultExt}`, function (err) {
      if (err) {
        throw err;
      }
    });

    return resultExt;
  },
  error: function (res, err, req) {
    console.log(err, "===========================>error");
    let code = typeof err === "object" ? (err.code ? err.code : 401) : 401;
    let message =
      typeof err === "object" ? (err.message ? err.message : "") : err;

    if (req) {
      req.flash("flashMessage", {
        color: "error",
        message,
      });

      const originalUrl = req.originalUrl.split("/")[1];
      return res.redirect(`/${originalUrl}`);
    }

    return res.status(code).json({
      success: false,
      message: message,
      code: code,
      body: {},
    });
  },
  authenticateToken: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, secret, async (err, user) => {
        if (err) {
          return res.sendStatus(401);
        }

        let userInfo = await userModel.findOne({
          _id: user._id,
          loginTime: user.loginTime
        });
        if (userInfo) {
          userInfo = JSON.parse(JSON.stringify(userInfo));
          req.user = userInfo;

          next();
        } else {
          return helper.error(res, "Invalid token");
        }
      });
    } else {
      res.sendStatus(401);
    }
  },
  opinalauthenticateToken: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret, async (err, user) => {
      if (err) {
        return res.sendStatus(401); // Invalid token
      }

      let userInfo = await userModel.findOne({
        _id: user._id,
        loginTime: user.loginTime,
      });

      if (userInfo) {
        userInfo = JSON.parse(JSON.stringify(userInfo));
        req.user = userInfo;
        next();
      } else {
        return helper.error(res, "Invalid token");
      }
    });
  },
  async fileUpload(files, folder = "users") {
    const file_name_string = files.name;
    const file_name_array = file_name_string.split(".");
    const file_ext = file_name_array[file_name_array.length - 1];

    const letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    let result = "";

    while (result.length < 28) {
      const rand_int = Math.floor(Math.random() * 19 + 1);
      const rand_chr = letters[rand_int];
      if (result.substr(-1, 1) !== rand_chr) result += rand_chr;
    }

    const resultExt = `${result}.${file_ext}`;

    console.log("🚀 ~ file: file.js:2--1 ~ fileUpload ~ resultExt:", resultExt);
    await files.mv(`public/images/${folder}/${resultExt}`, function (err) {
      if (err) {
        throw err;
      }
    });

    return resultExt;
  },
  //this is notification for send detail of push notitication
  send_push_notifications: (
    get_message,
    device_token,
    device_type,
    recievername,
    recieverimge,
    target_id,
    notification_type,
    target_name,
    target_image,
    surveyId,
    surveyComplete,
    Charityid,
    ContestId,
    total_attempted_survey,
    data_to_send
  ) => {
    if (device_type == 1) {
      const apn = require("apn");
      var options = {
        token: {
          key: path.join(__dirname, "/AuthKey_Q3NW9UXH2J.p8"),

          keyId: "Q3NW9UXH2J",
          teamId: "4XVQBWH9QF",
        },
        production: false,
      };
      const apnProvider = new apn.Provider(options);
      if (device_token && device_token != "") {
        var message = {
          to: device_token,
          data: {
            title: "Because",
            priority: "high",
            body: get_message,
            device_token: device_token,
            device_type: device_type,
            recievername: recievername,
            recieverimge: recieverimge,
            notification_type,
            sender_id: target_id,
            sender_name: target_name,
            sender_image: target_image,
            surveyId: surveyId,
            surveyComplete: surveyComplete,
            Charityid: Charityid,
            contestId: ContestId,
            total_attempted_survey: total_attempted_survey,
            model: data_to_send,
            sound: "default",
          },
        };

        if (device_token && device_token != "") {
          var myDevice = device_token;
          var note = new apn.Notification();
          let bundleId = "com.BecauseDev";

          note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
          note.badge = 0;
          note.sound = "default";
          note.title = "Because";
          note.body = get_message;
          note.payload = message;
          note.topic = bundleId;
          note.notificationtype = notification_type;
          (note.sender_id = target_id),
            (note.sender_name = target_name),
            (note.sender_image = target_image),
            (note.surveyId = surveyId),
            (note.surveyComplete = surveyComplete),
            (note.Charityid = Charityid);
          note.contestId = ContestId;
          note.totalAttemptedSurvey = total_attempted_survey;
          apnProvider
            .send(note, myDevice)
            .then((suc) => {
              if (suc.failed) {
                console.log(suc.failed, ">>>>>>>>>>>> PUSH NOT SENT >>>>>>>");
              }
              if (suc.sent) {
                console.log(
                  suc.sent,
                  suc,
                  ">>>>>>>>>>>>SUCESSS PUSH SENT >>>>>>>"
                );
              }
            })
            .catch((err) => {
              console.log(
                err,
                ">>>>>>>ERROR ON IOS SIDE PUSH NOT SENT >>>>>>>"
              );
            });
        } else {
          console.log("push sent not sent empty  device token");
        }
      }
    } else if (device_type == 2) {
      if (device_token && device_token != null) {
        var message = {
          to: device_token,

          notification: {
            title: "Because",
            priority: "high",
            body: get_message,
            device_token: device_token,
            device_type: device_type,
            recievername: recievername,
            recieverimge: recieverimge,
            notification_type,
            sender_id: target_id,
            sender_name: target_name,
            target_image: target_image,
            surveyId: surveyId,
            contestId: ContestId,
            model: data_to_send,
            sound: "default",
          },

          data: {
            title: "Because",
            priority: "high",
            body: get_message,
            device_token: device_token,
            device_type: device_type,
            recievername: recievername,
            recieverimge: recieverimge,
            notification_type,
            sender_id: target_id,
            sender_name: target_name,
            target_image: target_image,
            surveyId: surveyId,
            contestId: ContestId,
            model: data_to_send,
            sound: "default",
          },
        };

        // if (device_type == 0) {
        var serverKey =
          "AAAApneiuec:APA91bHILgIWGwcYmAU0Fsf7tqfjiW3H_qy4cVwHItI2f2FTquuIUuKHiwf4veDuSQZTcGW3isRHo4ZEE1qyzTF-iYPIHV2FkaFhc7dev4j1rthBqpu9UCfH_GI5bGbAR8XvyfTw5aS2";
        // var serverKey = process.env.SERVER_KEY;
        //put your server key here
        var fcm = new FCM(serverKey);
        fcm.send(message, function (err, response) {
          if (err) {
            console.log("Something has gone wrong!===========", message);
            console.log(err, ">>>>>>>iessu please check >>>>>");
          } else {
            console.log("Successfully sent with response: ", response);
          }
        });
        // }
      } else {
        return;
      }
    }
  },
  //this is notification for send detail of push notitication
  fileUploadchat: (file) => {
    if (file.name) {
      let extention = file.name;

      image = `${uuid()}.${extention}`;
      let imagePath = `/uploads/images/${image}`;

      file.mv(process.cwd() + `/public/images/` + image, function (err) {
        if (err) return err;
      });
      return image;
    } else {
      return "";
    }
  },
  createRateLimiter: ({ windowMs, max, message,}) => {
    const limiter = rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
    },
  });

  return limiter;
  }


};
