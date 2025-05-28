// var { v4: uuid } = require('uuid');
var path = require("path");
const fs = require('fs');
const apn = require('apn');


const user_model = require("../Model/userModel");
// const { v4: uuidv4 } = require('uuid');
const uuid = require("uuid").v4;
const bcrypt = require("bcrypt");
const { Validator } = require("node-input-validator");
var jwt = require("jsonwebtoken");
const secretCryptoKey =
  process.env.jwtSecretKey || "secret_iBabycoachs_@onlyF0r_JWT";
// const stripe = require('stripe')(process.env.SECRETKEY)
const SECRET_KEY = process.env.SECRET_KEY;
const PUBLISH_KEY = process.env.PUBLISH_KEY;
var FCM = require("fcm-node");
const translate = require("translate-google");
// const textToTranslate = 'Hello, how are you?';
const sourceLanguage = "en";
const targetLanguage = "ar";
// let hash =  bcrypt.hash("secret_KeyFor_jobbie_@#!$", 10).then((res)=>{
//   console.log("🚀  file: ApiController.js:31  hash:", res)
// })

const langdetect = require("langdetect");
module.exports = {
  lang: async (language_type, textToTranslate) => {
    try {
      const sourceLanguage = "en";
      const targetLanguage = language_type;
      const translation = await translate(textToTranslate, {
        from: sourceLanguage,
        to: targetLanguage,
      });
      return translation;
    } catch (err) {
      console.log(err);
    }
  },
  imageUpload: (file, folder = "user") => {
    if (!file || !file.name) return;
  
    let fileSizeKB = file.size / 1024; 
    console.log(`File size: ${fileSizeKB.toFixed(2)} KB`); 
  
    let file_name_string = file.name;
    var file_name_array = file_name_string.split(".");
    var file_extension = file_name_array[file_name_array.length - 1];
  
    var result = uuid();
    let name = result + "." + file_extension;
  
    file.mv("public/" + folder + "/" + name, function (err) {
      if (err) throw err;
    });
  
    return {
      path: "/" + folder + "/" + name,
      sizeKB: fileSizeKB.toFixed(2) // Returning the file size in KB
    };
  },
  
  imageUploadrop: (file, folder = "user") => {
    // If the file is a base64 string, process it
    if (file && file.startsWith('data:image')) {
      // Extract the file extension and base64 data
      const matches = file.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const imageType = matches[1];  // e.g., 'jpeg', 'png'
        const base64Data = matches[2];
        
        // Generate a unique name for the image
        const result = uuid();
        const fileName = result + '.' + imageType;
        const filePath = path.join(__dirname, '..', 'public', folder, fileName);
        
        // Decode the base64 string and save the image to the server
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Write the buffer to a file in the public folder
        fs.writeFileSync(filePath, buffer);
  
        // Return the path to the saved image
        return "/" + folder + "/" + fileName;
      }
    }
    return null;  // Return null if the file is not a base64 string
  },
   saveCroppedImage : (base64Data, imageName) => {
    return new Promise((resolve, reject) => {
      const base64DataWithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64DataWithoutPrefix, 'base64');
      const imagePath = path.join(__dirname, 'public', 'images', imageName);
      
      fs.writeFile(imagePath, imageBuffer, (err) => {
        if (err) {
          return reject('Error saving the image');
        }
        resolve(imagePath);
      });
    });
  },
  session: async (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      return res.redirect("/loginPage");
    }
  },

  success: function (res, message = "", body = {}) {
    return res.status(200).json({
      success: true,
      code: 200,
      message: message,
      body: body,
    });
  },

  error: function (res, err, req) {
    console.log(err, "====================>error");
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

  failed: function (res, message = "") {
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

  failed2: function (res, message = "") {
    message =
      typeof message === "object"
        ? message.message
          ? message.message
          : ""
        : message;
    return res.status(400).json({
      success: true,
      code: 200,
      message: message,
      body: [],
    });
  },

  failed403: function (res, message = "") {
    message =
      typeof message === "object"
        ? message.message
          ? message.message
          : ""
        : message;
    return res.status(403).json({
      success: false,
      code: 403,
      message: message,
      body: {},
    });
  },

  unixTimestamp: function () {
    var time = Date.now();
    var n = time / 1000;
    return (time = Math.floor(n));
  },

  findUserDeviceToken: async (userid) => {
    try {
      let data = await user_model.find({ _id: { $in: userid } });
      console.log(
        "🚀  file: helper.js:153  findUserDeviceToken:async ~ data:",
        data
      );
      return data;
    } catch (error) {}
  },

  readFile: async (path) => {
    console.log("********* readFile *****************");
    console.log(path, "********** pathreadFile *****************");
    return new Promise((resolve, reject) => {
      const readFile = util.promisify(fs.readFile);
      readFile(path)
        .then((buffer) => {
          resolve(buffer);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  writeFile: async (path, buffer) => {
    console.log("  ********** write file *****************");
    return new Promise((resolve, reject) => {
      const writeFile1 = util.promisify(fs.writeFile);
      writeFile1(path, buffer)
        .then((buffer) => {
          resolve(buffer);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  createVideoThumb: async (fileData, thumbnailPath) => {
    var VIDEO_THUMBNAIL_TIME = "00:00:02";
    var VIDEO_THUMBNAIL_SIZE = "300x200";
    var VIDEO_THUMBNAIL_TYPE = "video";
    return new Promise(async (resolve, reject) => {
      Thumbler(
        {
          type: VIDEO_THUMBNAIL_TYPE,
          input: fileData,
          output: thumbnailPath,
          time: VIDEO_THUMBNAIL_TIME,
          size: VIDEO_THUMBNAIL_SIZE, // this optional if null will use the desimention of the video
        },
        function (err, path) {
          if (err) reject(err);
          resolve(path);
        }
      );
    });
  },

  fileUploadMultiparty: async function (FILE, FOLDER, FILE_TYPE) {
    console.log(FILE, FOLDER, FILE_TYPE, "[----------data-------]");
    try {
      var FILENAME = FILE.name; // actual filename of file
      var FILEPATH = FILE.tempFilePath; // will be put into a temp directory

      THUMBNAIL_IMAGE_SIZE = 300;
      THUMBNAIL_IMAGE_QUALITY = 100;

      let EXT = fileExtension(FILENAME); //get extension
      EXT = EXT ? EXT : "jpg";
      FOLDER_PATH = FOLDER ? FOLDER + "/" : ""; // if folder name then add following "/"
      var ORIGINAL_FILE_UPLOAD_PATH = "/public/uploads/" + FOLDER_PATH;
      var THUMBNAIL_FILE_UPLOAD_PATH = "/public/uploads/" + FOLDER_PATH;
      var THUMBNAIL_FILE_UPLOAD_PATH_RETURN = "/uploads/" + FOLDER_PATH;
      var NEW_FILE_NAME = new Date().getTime() + "-" + "file." + EXT;
      var NEW_THUMBNAIL_NAME =
        new Date().getTime() +
        "-" +
        "thumbnail" +
        "-" +
        "file." +
        (FILE_TYPE == "video" ? "jpg" : EXT);

      let NEWPATH = path.join(
        __dirname,
        "../",
        ORIGINAL_FILE_UPLOAD_PATH,
        NEW_FILE_NAME
      );
      console.log(NEWPATH, "[=======NEWPATH======]");
      let THUMBNAIL_PATH = path.join(
        __dirname,
        "../",
        ORIGINAL_FILE_UPLOAD_PATH,
        NEW_THUMBNAIL_NAME
      );

      let FILE_OBJECT = {
        image: "",
        thumbnail: "",
        fileName: FILENAME,
        folder: FOLDER,
        file_type: FILE_TYPE,
      };

      console.log(FILEPATH, "====================FILEPATH");
      // return

      let BUFFER = await this.readFile(FILEPATH); //read file from temp path
      await this.writeFile(NEWPATH, BUFFER); //write file to destination

      FILE_OBJECT.image = THUMBNAIL_FILE_UPLOAD_PATH_RETURN + NEW_FILE_NAME;

      let THUMB_BUFFER = "";

      if (FILE_TYPE == "image") {
        // image thumbnail code
        var THUMB_IMAGE_TYPE = EXT == "png" ? "png" : "jpeg";
        THUMB_BUFFER = await sharp(BUFFER)
          .resize(THUMBNAIL_IMAGE_SIZE)
          .toFormat(THUMB_IMAGE_TYPE, {
            quality: THUMBNAIL_IMAGE_QUALITY,
          })
          .toBuffer();
        // FILE_OBJECT.thumbnail = THUMBNAIL_FILE_UPLOAD_PATH + NEW_THUMBNAIL_NAME;
        FILE_OBJECT.thumbnail =
          THUMBNAIL_FILE_UPLOAD_PATH_RETURN + NEW_THUMBNAIL_NAME;
        await this.writeFile(THUMBNAIL_PATH, THUMB_BUFFER);
      } else if (FILE_TYPE == "video") {
        // video thumbnail code
        await this.createVideoThumb(
          NEWPATH,
          THUMBNAIL_PATH,
          NEW_THUMBNAIL_NAME
        );
        FILE_OBJECT.thumbnail =
          THUMBNAIL_FILE_UPLOAD_PATH_RETURN + NEW_THUMBNAIL_NAME;
      } else {
        FILE_OBJECT.thumbnail = "";
      }
      return FILE_OBJECT;
    } catch (err) {
      console.log(err);
      throw err;
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

  authenticateHeader: async function (req, res, next) {
    const v = new Validator(req.headers, {
      secret_key: "required|string",
      publish_key: "required|string",
    });

    let errorsResponse = await module.exports.checkValidation(v); // Use the stored reference

    if (errorsResponse) {
      await module.exports.failed(res, errorsResponse);
    }

    if (
      req.headers.secret_key !== SECRET_KEY ||
      req.headers.publish_key !== PUBLISH_KEY
    ) {
      await module.exports.failed(res, "Key not matched!"); // Assuming failed function is defined somewhere
    }
    next();
  },

  authenticateJWT: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, secretCryptoKey, async (err, payload) => {
        if (err) {
          return res.status(401).json({
            success: false,
            code: 401,
            message: "invalid token",
            body: {},
          });
        }

        const existingUser = await user_model.findOne({
          _id: payload.data._id,
          // loginTime: payload.data.loginTime,
        });

        if (existingUser) {
          req.user = existingUser;

          next();
        } else {
          return res.status(401).json({
            success: false,
            code: 401,
            message: "Unauthorized token",
            body: {},
          });
        }
      });
    } else {
      return res.status(403).json({
        success: false,
        code: 403,
        message: "Token required",
        body: {},
      });
    }
  },

  verifyUser: async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      console.log("object");
      jwt.verify(token, SECRETCRYPTO_KEY, async (err, payload) => {
        if (err) {
          return res.sendStatus(403);
        }
        console.log("object,,,,,,,,", payload.data.id);
        const existingUser = await users.findOne({
          where: {
            id: payload.data.id,
            login_time: payload.data.login_time,
          },
        });
        console.log("existingUser,,,,,,,,,,,,,,,,,", existingUser);

        // const existingUser = await users.findOne({
        //   where: {
        //     id: payload.id,
        //     login_time: payload.login_time,
        //   },
        // });
        if (existingUser) {
          req.user = existingUser;
          next();
        } else {
          res.sendStatus(401);
        }
      });
    } else {
      res.sendStatus(401);
    }
  },

  //////////////////  STRIPE  /////////////////////
  strieCustomer: async (email) => {
    console.log(email);
    const customer = await stripe.customers.create({
      email: email,
    });
    return customer ? customer.id : "0";
  },

  stripeToken: async (req) => {
    const token = await stripe.tokens.create({
      card: {
        number: req.body.card_number,
        exp_month: req.body.expire_month,
        exp_year: req.body.expire_year,
      },
    });
    const source = await stripe.customers.createSource(
      req.user.stripe_customer,
      {
        source: token.id,
      }
    );

    return source ? source.id : "0";
  },

  stripePayment: async (req, res) => {
    var charge = await stripe.charges.create({
      amount: req.body.total * 1000,
      currency: "usd",
      customer: req.auth.customer_id,
      source: req.body.card_token,
      description: "Jobbie",
    });
    return charge;
  },

  paypalPayment: (order, req, item) => {
    return new Promise(async (resolve, reject) => {
      try {
        var formattedProducts = item.map((product) => {
          return {
            price: parseFloat(product.price).toFixed(2),
            quantity: parseInt(product.quantity),
          };
        });
        var totalQuantity = formattedProducts.reduce(
          (sum, product) => sum + product.quantity,
          0
        );

        await paypal.payment.create(
          {
            intent: "sale",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: `${req.protocol}://${req.get(
                "host"
              )}/api/paypalSuccessURL?amount=${parseFloat(
                order.total
              )}&orderId=${parseInt(order.id)}&status=1`,
              cancel_url: `${req.protocol}://${req.get(
                "host"
              )}/api/cancleUrl?status=0`,
            },
            transactions: [
              {
                item_list: {
                  items: [
                    {
                      name: "",
                      price: order.total,
                      currency: "USD",
                      quantity: 1,
                    },
                  ],
                },
                amount: {
                  total: order.total,
                  currency: "USD",
                },
                description: "Payment description",
              },
            ],
          },
          (error, payment) => {
            if (error) {
              reject(error);
            } else {
              const approval_url = payment.links.find(
                (link) => link.rel === "approval_url"
              ).href;
              resolve(approval_url);
            }
          }
        );
      } catch (error) {
        console.error("PayPal API Error:", error);
        reject(error);
      }
    });
  },

  SMTP: function (object) {
    var transporter = nodemailer.createTransport(config.mail_auth);
    var mailOptions = object;
    transporter.sendMail(mailOptions, function (error, info) {
      if (err) {
        throw error;
      } else {
        throw message;
      }
    });
  },

  calculateAverageRating: async (spot_id) => {
    try {
      const averageRatingPipeline = [
        {
          $match: {
            workerId: spot_id,
          },
        },
        {
          $group: {
            _id: "$workerId",
            averageRating: { $avg: "$rating" },
            ratingCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            averageRating: 1,
            ratingCount: 1,
          },
        },
      ];

      const spotAverageRatings = await review_model.aggregate(
        averageRatingPipeline
      );
      const result = spotAverageRatings[0];

      return result;
    } catch (error) {
      console.log(error);
    }
  },

  notificationData: async (data) => {
    const notificationObj = {
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
      type: data.type,
      status: 1,
    };
    const notify = await notification_model.create(notificationObj);
    return notify;
  },

  // send_push_notification: async function (
  //   deviceType,
  //   deviceToken,
  //   // type,
  //   sender_name,
  //   sender_image,
  //   payload,
  //   save_noti_data,
  //   // sender,
  //   ) {
  //   let dataForSend = {
  //   title: 'ibabycoach',
  //   body: payload.message,
  //   message: payload.message,
  //   deviceToken: deviceToken,
  //   deviceType: deviceType,
  //   sender_name: sender_name,
  //   sender_image: sender_image,
  //   notificationType: save_noti_data.type,
  //   userId: save_noti_data.receiver,
  //   user2Id: save_noti_data.sender,
  //   // data: sender,
  //   }

  //   console.log('===ddddd====deviceType', deviceType);
  //   // return

  //   if (deviceType == 1) {

  //   // if (deviceToken != '' && deviceToken != null) {

  //   console.log('---------------1------------------------');
  //   let message = {
  //   to: deviceToken,

  //   data: dataForSend,
  //   notification: dataForSend
  //   };

  //   var serverKey = "AAAAwS9BkG8:APA91bHy4wzjoLwcYEhnDrbt1D1TavsyfKxsGMc3cRmR2Iciq-gxQlahfKq9B-s7nXVPg_cQnFv7nTy0p_cnx9uayMRbBwO2aG4HOB3gfZ0sDnetGOUYjX8IgwvYko-wf6naHzJJKnjm"; //put
  //   var fcm = new FCM(serverKey);
  //   console.log('--message---', message, '---dataForSend---', dataForSend, '--end------');

  //   fcm.send(message, function (err, response) {
  //   if (err) {
  //   console.log("Something has gone wrong!", err);
  //   } else {
  //   console.log("Successfully sent with response: ", response);
  //   }
  //   });

  //   return fcm;
  //   // }
  //   }
  // },

  translateTextmultiple: async (name, description) => {
    var detectLanguage = async (text) => {
      const result = langdetect.detectOne(text);
      return result ? result : "Unknown Language";
    };

    const translateField = async (fieldText) => {
      let detectedLanguage = await detectLanguage(fieldText);
      let title_1, title_2;

      if (detectedLanguage === "ar") {
        // Translate from Arabic to English
        let res_data = await translate(fieldText, { from: "ar", to: "en" });
        title_1 = res_data;
        title_2 = fieldText;
      } else {
        // Translate from English to Arabic
        let res_data = await translate(fieldText, { from: "en", to: "ar" });
        title_1 = fieldText;
        title_2 = res_data;
      }
      return { title_1, title_2 };
    };

    // Translate all fields (name, description, and productUnit)
    const translatedName = await translateField(name);
    const translatedDescription = await translateField(description);
   


    return {
      name: translatedName,
      description: translatedDescription,
 
    };
  },


  translateTextmultiple2: async (Title, Description) => {
    const detectLanguage = async (text) => {
      try {
        return langdetect.detectOne(text) || "Unknown Language";
      } catch (error) {
        console.error("Error detecting language:", error);
        return "Unknown Language";
      }
    };
  
    const translateField = async (fieldText) => {
      let detectedLanguage = await detectLanguage(fieldText);
      let title_1, title_2;
  
      try {
        if (detectedLanguage === "ar") {
          title_1 = await translate(fieldText, { from: "ar", to: "en" });
          title_2 = fieldText;
        } else {
          title_1 = fieldText;
          title_2 = await translate(fieldText, { from: "en", to: "ar" });
        }
      } catch (error) {
        console.error("Error translating text:", error);
        title_1 = fieldText;
        title_2 = "Translation Failed";
      }
  
      return { title_1, title_2 };
    };
  
    const translatedTitle = await translateField(Title);
    const translatedDescription = await translateField(Description);
  
    return {
      Title: translatedTitle,
      Description: translatedDescription, // Fixed key name consistency
    };
  },
  translateTextmultiple1: async (question, answer) => {
    var detectLanguage = async (text) => {
      try {
        const result = langdetect.detectOne(text);
        return result ? result : "Unknown Language";
      } catch (error) {
        console.error("Error detecting language: ", error);
        return "Unknown Language";
      }
    };

    const translateField = async (fieldText) => {
      try {
        let detectedLanguage = await detectLanguage(fieldText);
        let title_1, title_2;

        if (detectedLanguage === "ar") {
          // Translate from Arabic to English
          let res_data = await translate(fieldText, { from: "ar", to: "en" });
          console.log("Arabic to English: ", res_data);
          title_1 = res_data;
          title_2 = fieldText;
        } else {
          // Translate from English to Arabic
          let res_data = await translate(fieldText, { from: "en", to: "ar" });
          console.log("English to Arabic: ", res_data);
          title_1 = fieldText;
          title_2 = res_data;
        }
        return { title_1, title_2 };
      } catch (error) {
        console.error("Error translating field text: ", error);
        return { title_1: fieldText, title_2: "Translation Error" }; // Fallback if translation fails
      }
    };

    // Translate question and answer
    const questionTranslation = await translateField(question);
    const answerTranslation = await translateField(answer);

    return {
      question: questionTranslation,
      answer: answerTranslation,
    };
  },

  translateText: async (text) => {
    const detectLanguage = async (text) => {
      if (!text || text.trim() === "") {
        return "Unknown Language";
      }
      const result = langdetect.detectOne(text);
      return result ? result : "Unknown Language";
    };
  
    let detectedLanguage = await detectLanguage(text);
    let title_1, title_2;
  
    try {
      if (detectedLanguage === "ar") {
        // Translate from Arabic to English
        let res_data = await translate(text, { from: "ar", to: "en" });
        console.log("Arabic to English: ", res_data);
        title_1 = res_data;
        title_2 = text;
      } else {
        // Translate from English to Arabic
        let res_data = await translate(text, { from: "en", to: "ar" });
        console.log("English to Arabic: ", res_data);
        title_1 = text;
        title_2 = res_data;
      }
    } catch (error) {
      console.error("Translation Error:", error.message);
      title_1 = text;
      title_2 = detectedLanguage === "ar" ? "Translation failed" : "فشل الترجمة";
    }
  
    return { title_1, title_2 };
  },


  
  send_push_notifications: (
    get_message,
    deviceToken,
    deviceType,
    recievername,
    recieverimge,
    target_id,
    notification_type,
    target_name,
    target_image,
    ProductId,

    data_to_send,
    title = "Shopping Guru"
  ) => {
    if (deviceType == 1) {
      const apn = require("apn");
      var options = {
        token: {
          key: path.join(__dirname, "../utility/AuthKey_ZA995DKJDB.p8"),

          keyId: "ZA995DKJDB",
          teamId: "MZBPN924PM",
        },
        production: false,
      };
      const apnProvider = new apn.Provider(options);
      if (deviceToken && deviceToken != "") {
        var message = {
          to: deviceToken,
          data: {
            title: title,
            priority: "high",
            body: get_message,
            deviceToken: deviceToken,
            deviceType: deviceType,
            recievername: recievername,
            recieverimge: recieverimge,
            notification_type,
            sender_id: target_id,
            sender_name: target_name,
            sender_image: target_image,
            ProductId: ProductId,

            model: data_to_send,
            sound: "default",
          },
        };

        if (deviceToken && deviceToken != "") {
          var myDevice = deviceToken;
          var note = new apn.Notification();
          let bundleId = "com.lives.Arabah";

          note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
          note.badge = 0;
          note.sound = "default";
          note.title = "Shopping Guru";
          note.body = get_message;
          note.payload = message;
          note.topic = bundleId;
          note.notificationtype = notification_type;
          (note.sender_id = target_id),
            (note.sender_name = target_name),
            (note.sender_image = target_image),
            (note.ProductId = ProductId),
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
    } else if (deviceType == 2) {
      if (deviceToken && deviceToken != null) {
        var message = {
          to: deviceToken,

          notification: {
            title: "Shopping Guru",
            priority: "high",
            body: get_message,
            deviceToken: deviceToken,
            deviceType: deviceType,
            recievername: recievername,
            recieverimge: recieverimge,
            notification_type,
            sender_id: target_id,
            sender_name: target_name,
            target_image: target_image,
            ProductId: ProductId,

            model: data_to_send,
            sound: "default",
          },

          data: {
            title: "Shopping Guru",
            priority: "high",
            body: get_message,
            deviceToken: deviceToken,
            deviceType: deviceType,
            recievername: recievername,
            recieverimge: recieverimge,
            notification_type,
            sender_id: target_id,
            sender_name: target_name,
            target_image: target_image,
            ProductId: ProductId,
            contestId: ContestId,
            model: data_to_send,
            sound: "default",
          },
        };

        // if (deviceType == 0) {
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
};
