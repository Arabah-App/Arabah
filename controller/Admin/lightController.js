const Model = require("../../Model/Index");
const categoryModel = require("../../Model/categoryModel");
const helper = require("../../utility/helper");
const helpers = require("../../utility/helpers");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const NotificationModel = require("../../Model/NotificationModel");
const userModel = require("../../Model/userModel");
const StoreModel = require("../../Model/StoreModel");
const mongoose = require("mongoose");
const JSON5 = require("json5");
const BrandModel = require("../../Model/BrandModel");
const ProductUnintModel = require("../../Model/ProductUnintModel");
const ExcelJS = require("exceljs");
module.exports = {
  bulkProductCreate: helpers.AsyncHanddle(async (req, res) => {
    try {
      if (!req.files || !req.files.csvFile) {
        return res.status(400).send("No CSV file uploaded.");
      }

      const csvFile = req.files.csvFile;
      const filePath = path.join(
        __dirname,
        "../../public/csvfile",
        csvFile.name
      );

      const csvDir = path.join(__dirname, "../../public/csvfile");
      if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true });
      }

      await csvFile.mv(filePath);

      const productsData = [];

      const getStoreIdByName = async (storeName) => {
        const store = await StoreModel.findOne({ _id: storeName });
        return store ? store._id : null;
      };

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          if (row.product) {
            productsData.push(row);
          }
        })
        .on("end", async () => {
          if (productsData.length === 0) {
            return res.status(400).send("CSV file is empty or invalid.");
          }

          const userId = req.session.user._id;
          const invalidProducts = [];

          for (const productData of productsData) {
            try {
              if (productData.product) {
                let cleanedProduct = productData.product
                  .trim()
                  .replace(/\\/g, "");
                if (
                  cleanedProduct.startsWith('"') &&
                  cleanedProduct.endsWith('"')
                ) {
                  cleanedProduct = cleanedProduct.slice(1, -1);
                }

                productData.product = JSON.parse(cleanedProduct);

                if (!Array.isArray(productData.product)) {
                  throw new Error("Product field should be an array");
                }

                const processedProducts = await Promise.all(
                  productData.product.map(async (productItem) => {
                    const shopId = await getStoreIdByName(productItem.shopName);
                    if (!shopId) {
                      throw new Error(
                        `Store not found for shopName: ${productItem.shopName}`
                      );
                    }

                    return {
                      shopName: shopId,
                      price: productItem.price || 0,
                      Location: productItem.Location || "",
                      date: productItem.date
                        ? new Date(productItem.date)
                        : new Date(),
                    };
                  })
                );

                productData.product = processedProducts;
              }

              if (!productData.name || !productData.price) {
                invalidProducts.push(productData);
                continue;
              }

              // const { name, description, ProdiuctUnit, Brandname } =
              //   await helper.translateTextmultiple(
              //     productData.name,
              //     productData.description,
              //     productData.ProdiuctUnit,
              //     productData.Brandname
              //   );

              let product = await Model.LightsModel.create({
                userId: userId,
                categoryNames: new mongoose.Types.ObjectId(
                  productData.categoryNames
                ),
                name: productData.name,
                nameArabic: productData.nameArabic,
                description: productData.description,
                descriptionArabic: productData.descriptionArabic,
                ProdiuctUnitArabic: productData.ProdiuctUnitArabic,
                productUnitId: productData.productUnitId,
                BrandID: productData.Brandname,
                price: productData.price ? productData.price : "0",
                product: productData.products,
                image: productData.image,
                BarCode: productData.BarCode,
              });
              console.log(product, "productproduct");
            
              await product.save();
            } catch (err) {
              console.log(
                `Error processing product data for ${productData.name}:`,
                err
              );
            }
          }

          if (invalidProducts.length > 0) {
            console.log(
              "The following products had missing name or price:",
              invalidProducts
            );
          }

          // Notification logic (send to all users except admins)
          const users = await userModel.find({ admin: { $ne: true } });
          const notifications = users.map((user) => ({
            userId: userId,
            ReciverId: user._id,
            message: "New Product Added",
            description: `A new product has been added.`,
            type: 1,
          }));

          await NotificationModel.insertMany(notifications);

          req.flash("msg", "Products added successfully with QR Code");
          res.redirect("/SubCategoryList");
        });
    } catch (err) {
      console.log("Error processing file:", err);
      req.flash("error", "Failed to process the CSV file.");
      res.status(500).send("Internal server error.");
    }
  }),

  addBulk: helpers.AsyncHanddle(async (req, res) => {
    let category = await categoryModel.find({ deleted: false });
    let store = await StoreModel.find();

    let title = "lights";
    res.render("Admin/lights/BulkProdcutadd", {
      title,
      category,
      store,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  addLights: helpers.AsyncHanddle(async (req, res) => {
    let category = await categoryModel.find({ deleted: false });
    let store = await StoreModel.find();
    let Brand = await BrandModel.find();
    let Productunit = await ProductUnintModel.find();
    let title = "lights";
    res.render("Admin/lights/addActivity", {
      title,
      category,
      Brand,
      Productunit,
      store,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  // lightCreate: helpers.AsyncHanddle(async (req, res) => {
  //   // if (req.files && req.files.image) {
  //   //   var image = req.files.image;
  //   //   if (image) {
  //   //     req.body.image = helper.imageUpload(image, "images");
  //   //   }
  //   // }

  //   const shopName = req.body["shopName[]"] || [];
  //   const price = req.body["price[]"] || [];
  //   const date = req.body["date[]"] || [];
  //   const Location = req.body["Location[]"] || [];

  //   const products = shopName
  //     .map((shopName, index) => ({
  //       shopName: shopName,
  //       price: price[index],
  //       date: date[index] || Date.now(),
  //       Location: Location[index],
  //     }))
  //     .filter((product) => product.shopName && product.price && product.date);

  //   const userId = req.session.user._id;
  //   const { name, description, ProdiuctUnit, Brandname } =
  //     await helper.translateTextmultiple(
  //       req.body.name,
  //       req.body.description,
  //       req.body.ProdiuctUnit,
  //       req.body.Brandname
  //     );

  //   try {
  //     if (req.body.image) {
  //       const base64Image = req.body.image;

  //       const imagePath = helper.imageUploadrop(base64Image, "images");
  //       const product = await Model.LightsModel.create({
  //         userId: userId,
  //         categoryNames: req.body.categoryNames,
  //         name: name.title_1,
  //         nameArabic: name.title_2,
  //         description: description.title_1,
  //         descriptionArabic: description.title_2, // Arabic description
  //         price: req.body.price,
  //         ProdiuctUnit: ProdiuctUnit.title_1, // English product unit
  //         ProdiuctUnitArabic: ProdiuctUnit.title_2, // Arabic product unit
  //         Brandname: Brandname.title_1,
  //         BrandnameArabic: Brandname.title_2,
  //         product: products,
  //         image: imagePath,
  //         qrCode: "",
  //       });

  //       const qrContent = JSON.stringify({
  //         userId,
  //         name: req.body.name,
  //         price: req.body.price,
  //         products,
  //         productId: product._id,
  //       });

  //       const qrFileName = `qr_${Date.now()}.png`;
  //       const qrFilePath = path.join(
  //         __dirname,
  //         "../../public/qr-codes",
  //         qrFileName
  //       );

  //       const qrDir = path.join(__dirname, "../../public/qr-codes");
  //       if (!fs.existsSync(qrDir)) {
  //         fs.mkdirSync(qrDir, { recursive: true });
  //       }

  //       await QRCode.toFile(qrFilePath, qrContent);

  //       const qrCodeUrl = `/qr-codes/${qrFileName}`;

  //       product.qrCode = qrCodeUrl;
  //       await product.save();

  //       const users = await userModel.find({ role: 1 });
  //       const admin = await userModel.find({ role: 0 });
  //       const firstAdmin = admin[0];

  //       const currentUserId = firstAdmin._id;

  //       // Create notifications
  //       const notifications = users.map((user) => ({
  //         userId: currentUserId, // Use the correct userId here
  //         ReciverId: user._id,
  //         ProductID: product._id,
  //         message: "New Product Added",
  //         description: "A new product has been added.",
  //         type: 1,
  //       }));

  //       await NotificationModel.insertMany(notifications);

  //       for (let user of users) {
  //         if (user.IsNotification === 0) {
  //           const msg = `${product.name} Product has been added`;
  //           const Receiver_name = user.name;
  //           const notification_type = 1;
  //           const ProductId = product._id;

  //           let not = await helper.send_push_notifications(
  //             msg,
  //             user.deviceToken,
  //             user.deviceType,
  //             Receiver_name,
  //             user.image,
  //             ProductId,

  //             notification_type
  //           );
  //         } else {
  //           console.log(`Notification is off for user: ${user.name}`);
  //         }
  //       }

  //       req.flash("msg", "Product added successfully with QR Code");
  //       res.redirect("/SubCategoryList");
  //     }
  //   } catch (err) {
  //     console.error("Error generating QR Code:", err);
  //     req.flash("error", "Failed to generate QR Code");
  //     res.redirect("/SubCategoryList");
  //   }
  // }),
  lightCreate: helpers.AsyncHanddle(async (req, res) => {
    const shopName = req.body["shopName[]"] || [];
    const price = req.body["price[]"] || [];
    const date = req.body["date[]"] || [];
    const Location = req.body["Location[]"] || [];

    const products = shopName
      .map((shopName, index) => ({
        shopName: shopName,
        price: price[index],
        date: date[index] || Date.now(),
        Location: Location[index],
      }))
      .filter((product) => product.shopName && product.price && product.date);

    const userId = req.session.user._id;

    try {
      let product = {};
      if (req.body.image) {
        const base64Image = req.body.image;

        const imagePath = helper.imageUploadrop(base64Image, "images");
        if (req.body.BarCode != "") {
          const existingProduct = await Model.LightsModel.findOne({
            BarCode: { $eq: req.body.BarCode },
          });

          if (existingProduct) {
            req.flash(
              "msg",
              "This barcode already exists. Please use a different barcode."
            );
            res.redirect("/AddSubCategory");
            return;
          }
        }

        product = await Model.LightsModel.create({
          userId: userId,
          categoryNames: req.body.categoryNames,
          name: req.body.name,
          nameArabic: req.body.nameArabic,
          description: req.body.description,
          descriptionArabic: req.body.descriptionArabic,
          ProdiuctUnitArabic: req.body.ProdiuctUnitArabic,
          productUnitId: req.body.productUnitId,
          BrandID: req.body.Brandname &&  mongoose.Types.ObjectId.isValid(req.body.Brandname)
          ? new mongoose.Types.ObjectId(req.body.Brandname) // Convert valid string to ObjectId
          : null,
          price: req.body.price ? req.body.price : "0",
          product: products,
          image: imagePath,
          BarCode: req.body.BarCode,
        });
      }
      const users = await userModel.find({ role: 1 });
      const admin = await userModel.find({ role: 0 });
      const firstAdmin = admin[0];

      const currentUserId = firstAdmin._id;

      // Create notifications
      const notifications = users.map((user) => ({
        userId: currentUserId, // Use the correct userId here
        ReciverId: user._id,
        ProductID: product._id,
        image: product.image,
        message: `${product.name} New Product Added`,
        message_Arabic: `${product.nameArabic} تمت إضافة منتج جديد`,
        description: "A new product has been added.",
        description_Arabic: "تمت إضافة منتج جديد.",
        type: 1,
      }));

      await NotificationModel.insertMany(notifications);
      for (let user of users) {
        if (user.IsNotification === 0) {
          const msg = `${product.name} Product has been added`;
          const Receiver_name = user.name;
          const notification_type = 1;
          const ProductId = product._id;

          let not = await helper.send_push_notifications(
            msg,
            user.deviceToken,
            user.deviceType,
            Receiver_name,
            user.image,
            ProductId,

            notification_type
          );
        } else {
          console.log(`Notification is off for user: ${user.name}`);
        }
      }

      // for (let user of users) {
      //   if (user.IsNotification === 0) {
      //     const msg = `${product.name} Product has been added`;
      //     const Receiver_name = user.name;
      //     const notification_type = 1;
      //     const ProductId = product._id;

      //     let not = await helper.send_push_notifications(
      //       msg,
      //       user.deviceToken,
      //       user.deviceType,
      //       Receiver_name,
      //       user.image,
      //       ProductId,
      //       notification_type
      //     );
      //   } else {
      //     console.log(`Notification is off for user: ${user.name}`);
      //   }
      // }

      req.flash("msg", "Product added successfully with QR Code");
      res.redirect("/SubCategoryList");
    } catch (err) {
      console.log("Somthing went wrong", err);
      req.flash("error", "Failed to somthing went wrong");
      res.redirect("/SubCategoryList");
    }
  }),

  findAlllights: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";
    let category = await categoryModel.find({ deleted: false });
    let lightsData;

    if (req.query.categoryNames) {
      lightsData = await Model.LightsModel.find({
        categoryNames: req.query.categoryNames,
      })
        .populate([
          { path: "userId", model: "User" },
          { path: "categoryNames", model: "Category" },
        ])
        .sort({ createdAt: -1 });
    } else {
      lightsData = await Model.LightsModel.find()
        .populate([
          { path: "userId", model: "User" },
          { path: "categoryNames", model: "Category" },
        ])
        .sort({ createdAt: -1 });
    }

    res.render("Admin/lights/ActivityList", {
      title,
      lightsData,
      category,
      session: req.session.user,
      selectedCategory: req.query.categoryNames,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  findbyidlights: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";
    const activityView = await Model.LightsModel.findById({
      _id: req.params.id,
    });
    console.log(activityView, "activityViewactivityView");
    res.render("Admin/category/viewActivity", {
      title,
      activityView,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  ProductComment: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";
    const lightdetail = await Model.LightsModel.findById({
      _id: req.params.id,
    });

    let comment = await Model.commentsModel
      .find({
        ProductID: req.params.id,
      })
      .populate([
        { path: "userId", model: "User" },
        { path: "ProductID", model: "light" },
      ]);

    res.render("Admin/lights/commentProduct", {
      title,
      lightdetail,
      comment,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  ProductRating: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";
    const lightdetail = await Model.LightsModel.findById({
      _id: req.params.id,
    });

    let rating = await Model.ratingModel
      .find({
        ProductID: req.params.id,
      })
      .populate([
        { path: "userId", model: "User" },
        { path: "ProductID", model: "light" },
      ]);

    res.render("Admin/lights/RatingProduct", {
      title,
      lightdetail,

      rating,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  ProductReport: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";
    const lightdetail = await Model.LightsModel.findById({
      _id: req.params.id,
    });

    let Report = await Model.reportModel
      .find({
        ProductID: req.params.id,
      })
      .populate([
        { path: "userId", model: "User" },
        { path: "ProductID", model: "light" },
      ]);

    res.render("Admin/lights/reportProduct", {
      title,
      lightdetail,

      Report,

      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  viewProduct: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";
    const lightdetail = await Model.LightsModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },

      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "categories",
          localField: "categoryNames",
          foreignField: "_id",
          as: "categoryNames",
        },
      },

      { $unwind: { path: "$categoryNames", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "brands", // Ensure the collection name is correct
          localField: "BrandID", // Ensure LightsModel has this field
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },

      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "prodiuctunits",
          localField: "productUnitId",
          foreignField: "_id",
          as: "Unit",
        },
      },
      { $unwind: { path: "$Unit", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "stores",
          localField: "product.shopName",
          foreignField: "_id",
          as: "product.shopName",
        },
      },

      {
        $unwind: {
          path: "$product.shopName",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          categoryNames: { $first: "$categoryNames" },
          name: { $first: "$name" },
          Brandname: { $first: "$brand.Brandname" },
          BrandnameArabic: { $first: "$brand.BrandnameArabic" },
          description: { $first: "$description" },
          BarCode: { $first: "$BarCode" },

          descriptionArabic: { $first: "$descriptionArabic" },
          price: { $first: "$price" },
          image: { $first: "$image" },
          qrCode: { $first: "$qrCode" },
          productUnitName: { $first: "$Unit.ProdiuctUnit" }, // ✅ Shows Unit Name
          deleted: { $first: "$deleted" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          product: {
            $push: {
              shopName: {
                _id: "$product.shopName._id",
                name: "$product.shopName.name",
                image: "$product.shopName.image",
              },
              price: "$product.price",
              Location: "$product.Location",
              date: "$product.date",
            },
          },
        },
      },
    ]);
    console.log(lightdetail);

    res.render("Admin/lights/viewProduct", {
      title,
      lightdetail: lightdetail[0],
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  editligths: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";
    // let store = await StoreModel.find();
    // let category = await categoryModel.find({ deleted: false });
    let store = await StoreModel.find();
    let Brand = await BrandModel.find();
    let Productunit = await ProductUnintModel.find();
    const lightdetail = await Model.LightsModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },

      { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "categories",
          localField: "categoryNames",
          foreignField: "_id",
          as: "categoryNames",
        },
      },

      { $unwind: { path: "$categoryNames", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "brands", // Ensure the collection name is correct
          localField: "BrandID", // Ensure LightsModel has this field
          foreignField: "_id",
          as: "brand",
        },
      },
      { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "prodiuctunits",
          localField: "productUnitId",
          foreignField: "_id",
          as: "Unit",
        },
      },
      { $unwind: { path: "$Unit", preserveNullAndEmptyArrays: true } },

      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "stores",
          localField: "product.shopName",
          foreignField: "_id",
          as: "product.shopName",
        },
      },

      {
        $unwind: {
          path: "$product.shopName",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          categoryNames: { $first: "$categoryNames" },
          name: { $first: "$name" },
          nameArabic: { $first: "$nameArabic" },
          descriptionArabic: { $first: "$descriptionArabic" },
          Brandname: { $first: "$brand.Brandname" },
          BrandnameArabic: { $first: "$brand.BrandnameArabic" },
          BarCode: { $first: "$BarCode" },
          description: { $first: "$description" },
          price: { $first: "$price" },
          image: { $first: "$image" },
          qrCode: { $first: "$qrCode" },
          productUnitName: { $first: "$Unit.ProdiuctUnit" },

          deleted: { $first: "$deleted" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
          product: {
            $push: {
              shopName: {
                _id: "$product.shopName._id",
                name: "$product.shopName.name",
                image: "$product.shopName.image",
              },
              _id: "$product._id",
              price: "$product.price",
              Location: "$product.Location",
              date: "$product.date",
            },
          },
        },
      },
    ]);
    console.log(lightdetail[0], "lightdetaillightdetail");

    res.render("Admin/lights/editActivity", {
      title,
      lightdetail: lightdetail[0],
      store: store,
      Brand: Brand,
      Productunit: Productunit,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  updatelights: helpers.AsyncHanddle(async (req, res) => {
    try {
      // console.log("Request Body:", req.body);

      if (!req.body.id) {
        console.error("ID not found in the request body");
        return res
          .status(400)
          .json({ error: "ID is missing in the request body." });
      }

      let products = [];

      let priceUpdated = false;
      const productKeys = Object.keys(req.body).filter((key) =>
        key.startsWith("product[")
      );
      const productCount = productKeys.length / 5;

      for (let i = 0; i < productCount; i++) {
        const productId = req.body[`product[${i}][_id]`];
        const price = parseFloat(req.body[`product[${i}][price]`]);
        const date = req.body[`product[${i}][date]`]
          ? new Date(req.body[`product[${i}][date]`])
          : new Date();
        const location = req.body[`product[${i}][Location]`];
        const shopName = req.body[`product[${i}][shopName]`];

        const productData = {
          // _id: new mongoose.Types.ObjectId(validProductId),
          price,
          date,
          Location: location,
          shopName: new mongoose.Types.ObjectId(shopName),
        };

        products.push(productData);

        if (productId && price && date && location && shopName) {
          try {
            const validProductId = Array.isArray(productId)
              ? productId[0]
              : productId;

            if (
              !mongoose.Types.ObjectId.isValid(validProductId) ||
              !mongoose.Types.ObjectId.isValid(shopName)
            ) {
              console.error("Invalid ID(s) found");
              continue;
            }

            // Fetch current product details
            const currentProduct = await Model.LightsModel.findById(
              req.body.id
            );
            const currentProductData = currentProduct?.product?.find(
              (p) => p._id.toString() === validProductId
            );
            const previousPrice = currentProductData?.price || 0;
            const previousDate = currentProductData?.date || 0;

            if (previousPrice !== price) {
              priceUpdated = true;

              const previousEntry = {
                price: previousPrice,
                shopName: new mongoose.Types.ObjectId(shopName),
                date: previousDate,
              };

              const newEntry = {
                price: price,
                shopName: new mongoose.Types.ObjectId(shopName),
                date: date,
              };

              // Check if the latest price entry already exists
              const lastUpdate = await Model.LightsModel.findOne(
                { _id: req.body.id, "updatedList.shopName": shopName },
                { "updatedList.$": 1 }
              );

              if (!lastUpdate || lastUpdate.updatedList[0]?.price !== price) {
                await Model.LightsModel.findByIdAndUpdate(
                  req.body.id,
                  {
                    $push: {
                      updatedList: { $each: [previousEntry, newEntry] },
                    },
                  },
                  { new: true }
                );
              }
            }
          } catch (err) {
            console.error("Error processing product:", err);
            return res
              .status(400)
              .json({ error: "Invalid product data format." });
          }
        }
      }

      if (products.length === 0) {
        console.error("Product data is missing or invalid.");
        return res
          .status(400)
          .json({ error: "Product data is missing or not valid." });
      }

      //     console.log(req.body.BrandID,">>>>>>>>>>>>>>>req.BrandID>>>>>>>" );
      //  return

      let image_check = req.body.image == "";
      if (image_check == false) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>> IMAGE CHECK >>>>");
        const base64Image = req.body.image;
        imagePath = helper.imageUploadrop(base64Image, "images");
        req.body.image = imagePath;
      } else {
        delete req.body.image;
      }

      req.body.product = products;
      const updatedProduct = await Model.LightsModel.findByIdAndUpdate(
        req.body.id,
        {
          ...req.body,
        },
        { new: true }
      );

      if (!updatedProduct) {
        console.error("Failed to update the product.");
        return res.status(404).json({ error: "Product not found." });
      }

      console.log("Updated Product:", updatedProduct);
      req.flash("msg", `${updatedProduct.name} Updated Successfully`);

      // Handle price update notifications
      if (priceUpdated) {
        const users = await userModel.find({ role: 1 });
        const admin = await userModel.find({ role: 0 });
        const firstAdmin = admin[0];

        const currentUserId = firstAdmin._id;
        const notifications = users.map((user) => ({
          userId: currentUserId,
          ReciverId: user._id,
          ProductID: updatedProduct._id,
          message: `${updatedProduct.name} Product New Price Update`,
          message_Arabic: `${updatedProduct.nameArabic} تحديث سعر المنتج الجديد`,
          description: "Product New Price Update",
          description_Arabic: "تحديث سعر المنتج الجديد",
          type: 2,
        }));

        await NotificationModel.insertMany(notifications);

        for (let user of users) {
          if (user.Notifyme === 1) {
          
       
            const notification_type = 1;
         
            const ProductId = updatedProduct._id;
            await helper.send_push_notifications(
             `${updatedProduct.name} Product New Price Update`,
              user.deviceToken,
              user.deviceType,
              user.name,
              user.image,
              ProductId,

              notification_type
            );
          } else {
            console.log(`Notification is off for user: ${user.name}`);
          }
        }
      }

      return res.redirect("/SubCategoryList");
    } catch (error) {
      console.error("Error updating product:", error);
      req.flash("msg", "An error occurred while updating the product.");
      return res.status(500).json({ error: "Internal server error." });
    }
  }),

  // updatelights: helpers.AsyncHanddle(async (req, res) => {
  //   try {
  //       console.log("Request Body:", req.body);

  //       if (!req.body.id) {
  //           return res.status(400).json({ error: "ID is missing in the request body." });
  //       }

  //       // Handle Image Upload
  //       if (req.files && req.files.image) {
  //           const image = req.files.image;
  //           req.body.image = helper.imageUpload(image, "images");
  //       }

  //       let products = [];
  //       let priceUpdated = false;
  //       const productKeys = Object.keys(req.body).filter((key) => key.startsWith("product["));
  //       const productCount = productKeys.length / 5;

  //       for (let i = 0; i < productCount; i++) {
  //           const productId = req.body[`product[${i}][_id]`];
  //           const price = parseFloat(req.body[`product[${i}][price]`]);
  //           const date = req.body[`product[${i}][date]`]
  //               ? new Date(req.body[`product[${i}][date]`])
  //               : new Date();
  //           const location = req.body[`product[${i}][Location]`];
  //           const shopName = req.body[`product[${i}][shopName]`];

  //           if (productId && price && date && location && shopName) {
  //               try {
  //                   const validProductId = Array.isArray(productId) ? productId[0] : productId;

  //                   if (!mongoose.Types.ObjectId.isValid(validProductId) || !mongoose.Types.ObjectId.isValid(shopName)) {
  //                       console.error("Invalid ID(s) found");
  //                       continue;
  //                   }

  //                   const productData = {
  //                       _id: new mongoose.Types.ObjectId(validProductId),
  //                       price,
  //                       date,
  //                       Location: location,
  //                       shopName: new mongoose.Types.ObjectId(shopName),
  //                   };

  //                   products.push(productData);

  //                   // Fetch current product details
  //                   const currentProduct = await Model.LightsModel.findById(req.body.id);
  //                   if (!currentProduct) {
  //                       console.error("Product not found.");
  //                       return res.status(404).json({ error: "Product not found." });
  //                   }

  //                   const currentProductData = currentProduct?.product?.find((p) => p._id.toString() === validProductId);
  //                   const previousPrice = currentProductData?.price || 0;
  //                   const previousDate = currentProductData?.date || 0;

  //                   if (previousPrice !== price) {
  //                       priceUpdated = true;

  //                       const newEntry = {
  //                           price: price,
  //                           shopName: new mongoose.Types.ObjectId(shopName),
  //                           date: new Date(),
  //                       };

  //                       // Update only if the latest entry does not already exist
  //                       const lastUpdate = await Model.LightsModel.findOne(
  //                           { _id: req.body.id, "updatedList.shopName": shopName },
  //                           { "updatedList.$": 1 }
  //                       );

  //                       if (!lastUpdate || lastUpdate.updatedList[0]?.price !== price) {
  //                           await Model.LightsModel.findByIdAndUpdate(
  //                               req.body.id,
  //                               { $push: { updatedList: newEntry } },
  //                               { new: true }
  //                           );
  //                       }
  //                   }
  //               } catch (err) {
  //                   console.error("Error processing product:", err);
  //                   return res.status(400).json({ error: "Invalid product data format." });
  //               }
  //           }
  //       }

  //       if (products.length === 0) {
  //           return res.status(400).json({ error: "Product data is missing or not valid." });
  //       }

  //       // Updating the product details
  //       const updatedProduct = await Model.LightsModel.findByIdAndUpdate(
  //           req.body.id,
  //           {
  //               name: req.body.name,
  //               nameArabic: req.body.nameArabic,
  //               Brandname: req.body.Brandname,
  //               description: req.body.description,
  //               descriptionArabic: req.body.descriptionArabic,
  //               productUnitId: req.body.productUnitId,
  //               price: req.body.price,
  //               BarCode: req.body.BarCode,
  //               image: req.body.image,
  //               product: products,
  //           },
  //           { new: true }
  //       );

  //       if (!updatedProduct) {
  //           return res.status(404).json({ error: "Product not found." });
  //       }

  //       console.log("Updated Product:", updatedProduct);
  //       req.flash("msg", `${updatedProduct.name} Updated Successfully`);

  //       // Handle price update notifications
  //       if (priceUpdated) {
  //           const users = await userModel.find({ role: 1 });
  //           const admin = await userModel.find({ role: 0 });
  //           const firstAdmin = admin[0];

  //           const notifications = users.map((user) => ({
  //               userId: firstAdmin._id,
  //               ReciverId: user._id,
  //               ProductID: updatedProduct._id,
  //               message: `${updatedProduct.name} Product New Price Update`,
  //               description: "Product New Price Update",
  //               type: 2,
  //           }));

  //           await NotificationModel.insertMany(notifications);

  //           for (let user of users) {
  //               if (user.Notifyme === 1) {
  //                   await helper.send_push_notifications(
  //                       `${updatedProduct.name} Product New Price Update`,
  //                       user.deviceToken,
  //                       user.deviceType,
  //                       user.name,
  //                       user.image,
  //                       updatedProduct._id,
  //                       2
  //                   );
  //               }
  //           }
  //       }

  //       return res.redirect("/SubCategoryList");

  //   } catch (error) {
  //       console.error("Error updating product:", error);
  //       req.flash("msg", "An error occurred while updating the product.");
  //       return res.status(500).json({ error: "Internal server error." });
  //   }
  // }),

  //corrcet
  // updatelights: helpers.AsyncHanddle(async (req, res) => {
  //   try {
  //     console.log("Request Body:", req.body);

  //     if (!req.body.id) {
  //       console.error("ID not found in the request body");
  //       return res
  //         .status(400)
  //         .json({ error: "ID is missing in the request body." });
  //     }

  //     if (req.files && req.files.image) {
  //       const image = req.files.image;
  //       if (image) {
  //         req.body.image = helper.imageUpload(image, "images");
  //       }
  //     }

  //     let products = [];
  //     if (req.body.storeData) {
  //       try {
  //         products = JSON.parse(req.body.storeData);
  //         console.log("Parsed storeData:", products);
  //       } catch (error) {
  //         console.error("JSON Parsing Error:", error.message);
  //         return res
  //           .status(400)
  //           .json({ error: "Invalid JSON format in storeData." });
  //       }
  //     }

  //     let priceUpdated = false;
  //     const productKeys = Object.keys(req.body).filter((key) =>
  //       key.startsWith("product[")
  //     );
  //     const productCount = productKeys.length / 5;

  //     for (let i = 0; i < productCount; i++) {
  //       const productId = req.body[`product[${i}][_id]`];
  //       const price = req.body[`product[${i}][price]`];
  //       const date = req.body[`product[${i}][date]`];
  //       const location = req.body[`product[${i}][Location]`];
  //       const shopName = req.body[`product[${i}][shopName]`];

  //       console.log(price,"price 1212121@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

  //       if (productId && price && date && location && shopName) {
  //         try {
  //           const validProductId = Array.isArray(productId)
  //             ? productId[0]
  //             : productId;

  //           if (!mongoose.Types.ObjectId.isValid(validProductId)) {
  //             console.error("Invalid product ID:", validProductId);
  //             continue;
  //           }
  //           if (!mongoose.Types.ObjectId.isValid(shopName)) {
  //             console.error("Invalid shopName ID:", shopName);
  //             continue;
  //           }

  //           const productDate = new Date(date);

  //           const productUnixTimestamp = Math.floor(
  //             productDate.getTime() / 1000
  //           );

  //           const currentDate = new Date();
  //           const currentUnixTimestamp = Math.floor(
  //             currentDate.getTime() / 1000
  //           );

  //           const differenceInSeconds =
  //             currentUnixTimestamp - productUnixTimestamp;

  //           const sevenDaysInSeconds = 7 * 24 * 60 * 60;

  //           const isWithinSevenDays =
  //             differenceInSeconds <= sevenDaysInSeconds &&
  //             differenceInSeconds >= 7;

  //           const productData = {
  //             _id: new mongoose.Types.ObjectId(validProductId),
  //             price: parseFloat(price),
  //             date: new Date(date),
  //             Location: location,
  //             shopName: new mongoose.Types.ObjectId(shopName),
  //           };

  //           products.push(productData);

  //           const currentProduct = await Model.LightsModel.findById(
  //             req.body.id
  //           );
  //           const currentProductPrice = currentProduct?.product?.find(
  //             (p) => p._id.toString() === validProductId
  //           )?.price;

  //           if (currentProductPrice && currentProductPrice !== parseFloat(price)) {
  //             const updatedListEntry = {
  //                 price: parseFloat(price),
  //                 shopName: new mongoose.Types.ObjectId(shopName),
  //                 date: new Date(),
  //             };

  //             if (currentProductPrice !== parseFloat(price)) {
  //                 priceUpdated = true;
  //             }

  //             const lastUpdate = await Model.LightsModel.findOne(
  //                 { _id: req.body.id, "updatedList.shopName": shopName },
  //                 { "updatedList.$": 1 }
  //             );

  //             if (!lastUpdate || lastUpdate.updatedList[0]?.price !== parseFloat(price)) {
  //                 await Model.LightsModel.findByIdAndUpdate(
  //                     req.body.id,
  //                     {
  //                         $push: {
  //                             updatedList: updatedListEntry,
  //                         },
  //                     },
  //                     { new: true }
  //                 );
  //             }
  //         }
  //         } catch (err) {
  //           console.error("Error processing product:", err);
  //           return res
  //             .status(400)
  //             .json({ error: "Invalid product data format." });
  //         }
  //       }
  //     }

  //     if (products.length === 0) {
  //       console.error("Product data is missing or invalid.");
  //       return res
  //         .status(400)
  //         .json({ error: "Product data is missing or not valid." });
  //     }

  //     // Translate text fields

  //     if (req.files && req.files.image) {
  //       var image = req.files.image;
  //       if (image) {
  //         const uploadedImage = helper.imageUpload(image, "images");
  //         req.body.image = uploadedImage.path; // Store only the path as a string
  //       }
  //     }

  //     const updatedProduct = await Model.LightsModel.findByIdAndUpdate(
  //       req.body.id,
  //       {
  //         name: req.body.name,
  //         nameArabic: req.body.nameArabic,
  //         Brandname: req.body.Brandname,

  //         description: req.body.description,
  //         descriptionArabic: req.body.descriptionArabic,
  //         productUnitId: req.body.productUnitId,

  //         price: req.body.price,
  //         BarCode: req.body.BarCode,

  //         image: req.body.image,
  //         product: products,
  //       },
  //       { new: true }
  //     );

  //     if (priceUpdated) {
  //       const users = await userModel.find({ role: 1 });
  //       const admin = await userModel.find({ role: 0 });
  //       const firstAdmin = admin[0];

  //       const currentUserId = firstAdmin._id;

  //       // Create notifications
  //       const notifications = users.map((user) => ({
  //         userId: currentUserId,
  //         ReciverId: user._id,
  //         ProductID: updatedProduct._id,
  //         message: `${updatedProduct.name}Product New Price Update`,
  //         description: "Product New Price Update",
  //         type: 2,
  //       }));

  //       await NotificationModel.insertMany(notifications);

  //       for (let user of users) {
  //         if (user.Notifyme === 1) {
  //           const msg = `${updatedProduct.name}Product New Price Update`;
  //           const Receiver_name = user.name;
  //           const notification_type = 2;
  //           const ProductId = updatedProduct._id;

  //           let not = await helper.send_push_notifications(
  //             msg,
  //             user.deviceToken,
  //             user.deviceType,
  //             Receiver_name,
  //             user.image,
  //             ProductId,
  //             notification_type
  //           );
  //         } else {
  //           console.log(`Notification is off for user: ${user.name}`);
  //         }
  //       }
  //     }

  //     if (!updatedProduct) {
  //       console.error("Failed to update the product.");
  //       return res.status(404).json({ error: "Product not found." });
  //     }

  //     console.log("Updated Product:", updatedProduct);
  //     req.flash("msg", `${updatedProduct.name} Updated Successfully`);

  //     // Redirect to the SubCategoryList page
  //     return res.redirect("/SubCategoryList");
  //   } catch (error) {
  //     console.error("Error updating product:", error);
  //     req.flash("msg", `An error occurred while updating the product.`);
  //   }
  // }),

  editproductcommment: async (req, res) => {
    try {
      const activitydetail = await Model.commentsModel
        .findById({
          _id: req.params.id,
        })
        .populate([
          { path: "userId", model: "User" },
          { path: "ProductID", model: "light" },
        ]);
      res.render("Admin/lights/EditCommentProduct.ejs", {
        title: "",

        activitydetail,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  viewproductreport: async (req, res) => {
    try {
      const activitydetail = await Model.reportModel
        .findById({
          _id: req.params.id,
        })
        .populate([
          { path: "userId", model: "User" },
          { path: "ProductID", model: "light" },
        ]);
      console.log("🚀 ~ viewreport: ~ activitydetail:", activitydetail);
      res.render("Admin/lights/reportView.ejs", {
        title: "",
        activitydetail,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  checkBarCode: async (req, res) => {
    try {
      const activitydetail = await Model.LightsModel.findOne({
        BarCode: req.query.BarCode,
      });
      if (activitydetail) {
        return res.json(false); // Barcode already exists
      } else {
        return res.json(true); // Barcode is unique
      }
    } catch (error) {
      console.log(error);
    }
  },
  checkEditBarCode: async (req, res) => {
    try {
      const activitydetail = await Model.LightsModel.findOne({
        BarCode: req.query.BarCode,
        _id: {
          $ne: req.query.id,
        },
      });
      if (activitydetail) {
        return res.json(false); // Barcode already exists
      } else {
        return res.json(true); // Barcode is unique
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteLights: helpers.AsyncHanddle(async (req, res) => {
    let id = req.body.id;
    await Model.LightsModel.findByIdAndDelete(
      { _id: id },
      { deleted: true },
      { new: true }
    );
    res.redirect("/ActivityList");
  }),

  activityStatus: helpers.AsyncHanddle(async (req, res) => {
    await Model.LightsModel.updateOne(
      { _id: req.body.id },
      { status: req.body.value }
    );
    req.flash("msg", "Status update successfully");
    if (req.body.value == 0) res.send(false);
    if (req.body.value == 1) res.send(true);
  }),

  viewCustomizedActivity: helpers.AsyncHanddle(async (req, res) => {
    let title = "Activity";
    const activitydetail = await Model.LightsModel.findById({
      _id: req.params.id,
    }).populate("userId");
    res.render("Admin/category/viewCustomizedActivity", {
      title,
      activitydetail,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  findupdatedPrice: helpers.AsyncHanddle(async (req, res) => {
    let title = "lights";

    const activityView = await Model.LightsModel.findById(req.params.id)
      .select("updatedList name nameArabic categoryNames image")
      .lean();

    const shopIds = activityView.updatedList.map((item) => item.shopName);

    const storeDetails = await StoreModel.find({ _id: { $in: shopIds } })
      .select("name nameArabic")
      .lean();

    const updatedListWithStoreNames = activityView.updatedList.map((item) => {
      const store = storeDetails.find(
        (store) => store._id.toString() === item.shopName.toString()
      );
      return {
        ...item,
        storeName: store ? store.name : "Unknown Store",
        storeNameArabic: store ? store.nameArabic : "متجر غير معروف",
      };
    });
    updatedListWithStoreNames.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.render("Admin/lights/ProductPriceHsitory.ejs", {
      title: "lights",
      activityView: {
        ...activityView,
        updatedList: updatedListWithStoreNames,
      },
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  // DownloadPdfProduct:async(req,res)=>{
  //   try {

  //     const lightsData = await Model.LightsModel.find().populate('categoryNames');

  //     let htmlContent = `
  //       <html>
  //         <head>
  //           <style>
  //             body { font-family: Arial, sans-serif; margin: 20px; }
  //             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  //             th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
  //             th { background-color: #f2f2f2; }
  //             h2 { text-align: center; }
  //           </style>
  //         </head>
  //         <body>
  //           <h2>Product Listing Report</h2>
  //           <table>
  //             <thead>
  //               <tr>
  //                 <th>S NO.</th>
  //                 <th>Category Name</th>
  //                 <th>Category Name (Arabic)</th>
  //                 <th>Product Name</th>
  //                 <th>Product Name (Arabic)</th>

  //               </tr>
  //             </thead>
  //             <tbody>
  //     `;

  //     // Add rows dynamically
  //     lightsData.forEach((data, index) => {
  //       htmlContent += `
  //         <tr>
  //           <td>${index + 1}</td>
  //           <td>${data?.categoryNames?.categoryName || 'N/A'}</td>
  //           <td>${data?.categoryNames?.categoryNameArabic || 'N/A'}</td>
  //           <td>${data?.name || 'N/A'}</td>
  //           <td>${data?.nameArabic || 'N/A'}</td>

  //         </tr>
  //       `;
  //     });

  //     htmlContent += `
  //             </tbody>
  //           </table>
  //         </body>
  //       </html>
  //     `;

  //     // Launch Puppeteer
  //     const browser = await puppeteer.launch({
  //       headless: 'new', // Use new headless mode
  //     });
  //     const page = await browser.newPage();

  //     // Set the HTML content
  //     await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

  //     // Generate PDF from HTML
  //     const pdfBuffer = await page.pdf({
  //       format: 'A4',
  //       printBackground: true,
  //     });

  //     // Close the browser
  //     await browser.close();

  //     // Set response headers
  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.setHeader(
  //       'Content-Disposition',
  //       'attachment; filename="Product_List.pdf"'
  //     );

  //     // Send the PDF buffer to the browser
  //     res.end(pdfBuffer);
  //   } catch (error) {
  //     console.error('Error generating PDF:', error);
  //     res.status(500).send('Error generating PDF.');
  //   }
  // }
  DownloadExcelProduct: async (req, res) => {
    try {
      const lightsData = await Model.LightsModel.find()
        .populate("categoryNames")
        .populate("BrandID")
        .populate("productUnitId")
        .populate("product.shopName");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Product List");

      const baseColumns = [
        { header: "Category Name", key: "categoryName", width: 20 },
        {
          header: "Category Name (Arabic)",
          key: "categoryNameArabic",
          width: 20,
        },
        { header: "Product Name", key: "productName", width: 20 },
        {
          header: "Product Name (Arabic)",
          key: "productNameArabic",
          width: 20,
        },
        { header: "Brand Name", key: "Brandname", width: 20 },
        { header: "Brand Name (Arabic)", key: "BrandArabic", width: 20 },
        { header: "BarCode", key: "BarCode", width: 20 },
        { header: "Product Unit", key: "productUnitId", width: 20 },
      ];

      let maxShops = Math.max(
        ...lightsData.map((data) => data?.product?.length || 0)
      );

      if (maxShops > 0) {
        for (let i = 0; i < maxShops; i++) {
          baseColumns.push(
            { header: `Shop ${i + 1} Name`, key: `shopName_${i}`, width: 20 },
            { header: `Shop ${i + 1} Price`, key: `price_${i}`, width: 15 },
            {
              header: `Shop ${i + 1} Location`,
              key: `location_${i}`,
              width: 20,
            },
            { header: `Shop ${i + 1} Date`, key: `date_${i}`, width: 20 }
          );
        }
      } else {
        baseColumns.push(
          { header: "Shop Name", key: "shopName", width: 20 },
          { header: "Price", key: "price", width: 15 },
          { header: "Location", key: "Location", width: 20 },
          { header: "Date", key: "date", width: 20 }
        );
      }

      worksheet.columns = baseColumns;

      lightsData.forEach((data) => {
        let rowData = {
          categoryName: data?.categoryNames?.categoryName || "N/A",
          categoryNameArabic: data?.categoryNames?.categoryNameArabic || "N/A",
          productName: data?.name || "N/A",
          productNameArabic: data?.nameArabic || "N/A",
          Brandname: data?.BrandID?.Brandname || "N/A",
          BrandArabic: data?.BrandID?.BrandnameArabic || "N/A",
          BarCode: data?.BarCode || "N/A",
          productUnitId: data?.productUnitId?.ProdiuctUnit || "N/A",
        };

        if (data?.product?.length > 0) {
          data.product.forEach((prod, index) => {
            rowData[`shopName_${index}`] = prod?.shopName?.name || "N/A";
            rowData[`price_${index}`] = prod?.price || 0;
            rowData[`location_${index}`] = prod?.Location || "N/A";
            rowData[`date_${index}`] = prod?.date
              ? new Date(prod.date).toLocaleDateString("en-GB")
              : "N/A";
          });

          for (let i = data.product.length; i < maxShops; i++) {
            rowData[`shopName_${i}`] = "N/A";
            rowData[`price_${i}`] = 0;
            rowData[`location_${i}`] = "N/A";
            rowData[`date_${i}`] = "N/A";
          }
        } else {
          rowData["shopName"] = "N/A";
          rowData["price"] = 0;
          rowData["Location"] = "N/A";
          rowData["date"] = "N/A";
        }

        worksheet.addRow(rowData);
      });

      // lightsData.forEach((data, index) => {
      //   worksheet.addRow({

      //     categoryName: data?.categoryNames?.categoryName || 'N/A',
      //     categoryNameArabic: data?.categoryNames?.categoryNameArabic || 'N/A',
      //     productName: data?.name || 'N/A',
      //     productNameArabic: data?.nameArabic || 'N/A',
      //     Brandname: data?.BrandID?.Brandname || 'N/A',
      //     BrandArabic: data?.BrandID?.BrandnameArabic || 'N/A',
      //     BarCode: data?.BarCode || 'N/A',
      //     productUnitId: data?.productUnitId?.ProdiuctUnit || 'N/A',

      //   });
      // });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Product_List.xlsx"'
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating Excel:", error);
      res.status(500).send("Error generating Excel.");
    }
  },
};
