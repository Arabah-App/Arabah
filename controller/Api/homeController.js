const { default: mongoose } = require("mongoose");
const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const StoreModel = require("../../Model/StoreModel");
const helpers = require("../../utility/helpers");
const BrandModel = require("../../Model/BrandModel");
const FaqModel = require("../../Model/FaqModel");

module.exports = {
  home: async (req, res) => {
    try {
      let banner = await Model.bannerModel.find().select("image").lean();

      const { longitude, latitude, categoryId, categoryName } = req.query;

      if (!longitude || !latitude) {
        return res
          .status(400)
          .json({ error: "Longitude and latitude are required." });
      }

      let categoryFilter = {};
      if (categoryId) {
        const categoryIdsArray = categoryId.split(",");
        categoryFilter._id = {
          $in: categoryIdsArray.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      if (categoryName) {
        categoryFilter.categoryName = { $regex: new RegExp(categoryName, "i") };
      }

      const categoryData = await Model.CategoryModel.aggregate([
        // {
        //   $geoNear: {
        //     near: {
        //       type: "Point",
        //       coordinates: [parseFloat(longitude), parseFloat(latitude)],
        //     },
        //     distanceField: "distance",
        //     spherical: true,
        //     maxDistance: 20000,
        //     key: "location.coordinates",
        //   },
        // },
        { $match: categoryFilter },

        {
          $project: {
            _id: 1,
            categoryName: 1,
            image: 1,
            categoryNameArabic: 1,
          },
        },
      ]).sort({ createdAt: -1 }) // Correct position
      .limit(4);

      const categoryIdsInData = categoryData.map((category) => category._id);

      let LatestProductData;

      if (categoryIdsInData.length > 0) {
        LatestProductData = await Model.LightsModel.find({
          categoryNames: { $in: categoryIdsInData },
          product: { $not: { $size: 0 } },
        })
          .populate("BrandID")
          .populate("productUnitId")
          .sort({ createdAt: -1 })

          .limit(4)
          .lean();
        LatestProductData = LatestProductData.map((product) => {
          product.product.sort((a, b) => a.price - b.price);
          return product;
        }).sort((a, b) => a.product[0]?.price - b.product[0]?.price);
      } else {
        return helpers.success(res, "Empty products ", {
          banner: banner,
          Category: [],
          LatestProduct: [],
        });
      }
      let message = "home list";
      if (req.headers.language_type == "ar") {
        message = "قائمة المنزل";
      }

      return helper.success(res, message, {
        Banner: banner,
        Category: categoryData,
        LatestProduct: LatestProductData,
      });
    } catch (error) {
      console.log(error, "Something went wrong");
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  categoryFilter: async (req, res) => {
    try {
      const { longitude, latitude } = req.query;

      // const categoryData = await Model.CategoryModel.aggregate([
      //   // {
      //   //   $geoNear: {
      //   //     near: {
      //   //       type: "Point",
      //   //       coordinates: [parseFloat(longitude), parseFloat(latitude)],
      //   //     },
      //   //     distanceField: "distance",
      //   //     spherical: true,
      //   //     maxDistance: 3000,
      //   //     key: "location.coordinates",
      //   //   },
      //   // },
      // ]);

      const categoryData = await Model.CategoryModel.find()
      let message = "home list";
      if (req.headers.language_type == "ar") {
        message = "قائمة المنزل";
      }

      return helper.success(res, message, {
        Category: categoryData,
      });
    } catch (error) {
      console.log(error, "Somthing Went Wrong");
    }
  },
  // searchfilter: async (req, res) => {
  //   try {
  //     const { categoryName, longitude, latitude } = req.query;

  //     if (!longitude || !latitude) {
  //       return res
  //         .status(400)
  //         .json({ message: "Longitude and latitude are required" });
  //     }

  //     const parsedLongitude = parseFloat(longitude);
  //     const parsedLatitude = parseFloat(latitude);

  //     if (isNaN(parsedLongitude) || isNaN(parsedLatitude)) {
  //       return res
  //         .status(400)
  //         .json({ message: "Invalid longitude or latitude" });
  //     }

  //     let categoryFilter = {};
  //     if (categoryName) {
  //       categoryFilter = {
  //         categoryName: { $regex: new RegExp(categoryName, "i") },
  //         categoryNameArabic: { $regex: new RegExp(categoryName, "i") },
  //       };
  //     }

  //     const categoryData = await Model.CategoryModel.aggregate([
  //       {
  //         $geoNear: {
  //           near: {
  //             type: "Point",
  //             coordinates: [parsedLongitude, parsedLatitude],
  //           },
  //           distanceField: "distance",
  //           spherical: true,
  //           maxDistance: 3000,
  //           key: "location.coordinates",
  //         },
  //       },
  //       { $match: categoryFilter },
  //     ]);

  //     // let products = [];/*  */
  //     // if (categoryName) {
  //     //   products = await Model.LightsModel.find({
  //     //     name: { $regex: new RegExp(categoryName, "i") },
  //     //     Brandname: { $regex: new RegExp(categoryName, "i") },
  //     //   });
  //     // }

  //     let productFilter = {
  //       categoryNames: await Model.CategoryModel.findOne({
  //         categoryName: { $regex: new RegExp(categoryName, "i") },
  //         categoryNameArabic: { $regex: new RegExp(categoryName, "i") },
  //       }).select("_id"),
  //     };

  //     let shopIds = [];
  //     if (categoryName) {
  //       const shops = await StoreModel.find({
  //         name: { $regex: new RegExp(categoryName, "i") },
  //       }).select("_id");
  //       shopIds = shops.map((shop) => shop._id);
  //     }

  //     const products = await Model.LightsModel.find({
  //       $or: [
  //         { name: { $regex: new RegExp(categoryName, "i") } },
  //         { Brandname: { $regex: new RegExp(categoryName, "i") } },
  //         { "product.shopName": { $in: shopIds } },
  //       ],
  //     })
  //       .populate("categoryNames")
  //       .populate("product.shopName");

  //     if (!categoryData.length && !products.length) {
  //       return helper.failed(res, "No matching records found");
  //     }

  //     return helper.success(res, "Search results", {
  //       Categories: categoryData,
  //       Products: products,
  //     });
  //   } catch (error) {
  //     console.error("Error in searchfilter:", error);
  //     return res.status(500).json({ message: "Something went wrong" });
  //   }
  // },

  PriceNotification: async (req, res) => {
    try {
      let PriceNotification = await Model.UserModel.findByIdAndUpdate(
        req.user._id,
        {
          IsNotification: req.body.IsNotification,
        },
        { new: true }
      );

      let message = "Notifation Updated";
      if (req.headers.language_type == "ar") {
        message = "تم تحديث الإخطار";
      }
      return helper.success(res, message, PriceNotification);
    } catch (error) {
      console.log(error, "Something Went Erong");
    }
  },
  Notifyme: async (req, res) => {
    try {
      let Notifyme = await Model.UserModel.findByIdAndUpdate(
        req.user._id,
        {
          Notifyme: req.body.Notifyme,
        },
        { new: true }
      );

      let message = "Notifation Updated";
      if (req.headers.language_type == "ar") {
        message = "تم تحديث الإخطار";
      }
      return helper.success(res, message, Notifyme);
    } catch (error) {
      console.log(error, "Something Went Erong");
    }
  },

  allFilter: async (req, res) => {
    try {
      const { longitude, latitude } = req.query;

      const { categoryName } = req.query;
      let categoryFilter = {};

      if (categoryName) {
        categoryFilter.categoryName = { $regex: new RegExp(categoryName, "i") };
      }
      const categoryData = await Model.CategoryModel.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            distanceField: "distance",
            spherical: true,
            maxDistance: 3000,
            key: "location.coordinates",
          },
        },
        { $match: categoryFilter },
      ]);

      return helper.success(res, {
        Category: categoryData,
      });
    } catch (error) {
      console.log(error, "Somthing Went Wrong");
    }
  },
  FaQ_ListApi: async (req, res) => {
    try {
      const GoalData = await FaqModel.find();

      return helper.success(res, "", GoalData);
    } catch (error) {
      console.log(error);
    }
  },
};
