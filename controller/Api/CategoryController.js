const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const mongoose = require("mongoose");
const helpers = require("../../utility/helpers");
const LikeModel = require("../../Model/LikeModel");
const StoreModel = require("../../Model/StoreModel");

module.exports = {
  categorylist: async (req, res) => {
    try {
      let category = await Model.CategoryModel.find().select(
        "_id categoryName image categoryNameArabic"
      );

      return helper.success(res, "", category);
    } catch (error) {
      console.log(error, "Somethimg Went Wrong");
    }
  },
  SubCategoryProduct: async (req, res) => {
    try {
      const categoryId = new mongoose.Types.ObjectId(req.query.categoryId);

      let products = await Model.LightsModel.find({
        categoryNames: categoryId,
        product: { $not: { $size: 0 } },
      })
        .populate("BrandID")
        .populate("productUnitId");

      products = products
        .map((product) => {
          product.product.sort((a, b) => a.price - b.price);
          return product;
        })
        .sort((a, b) => a.product[0]?.price - b.product[0]?.price);

      return helper.success(res, "", products);
    } catch (error) {
      console.log(error, "Something Went Wrong");
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },
  LatestProduct: async (req, res) => {
    try {
      let products = await Model.LightsModel.find({
        product: { $not: { $size: 0 } },
      })
        .populate("BrandID")
        .populate("productUnitId")
        .sort({ CreatedAt: -1 });

      products = products
        .map((product) => {
          product.product.sort((a, b) => a.price - b.price);
          return product;
        })
        .sort((a, b) => a.product[0]?.price - b.product[0]?.price);
      return helper.success(res, "", products);
    } catch (error) {
      console.log(error, "Somethimg Went Wrong");
    }
  },
  ProductDetail: async (req, res) => {
    try {
      const Product = new mongoose.Types.ObjectId(req.query.id);

      let user = req.user ? req.user._id : null;

      const Like = await LikeModel.findOne({
        userId: user,
        ProductID: Product,
      });

      const likeValue = Like ? 1 : 0;

      const ratings = await Model.ratingModel.find({ ProductID: Product });
      let ratingCount;
      ratingCount = ratings.length ? ratings.length : 0;

      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
        ratings.length
        : 0;

      const allStore = await StoreModel.find();
      //       const ProductDetail = await Model.LightsModel.findById(Product)
      //         .populate({
      //           path: "product.shopName",
      //           model: "Store",
      //         })
      //         .populate("BrandID")
      //         .populate("productUnitId");





      //         const product = {
      //           // your product object here...
      //         };

      //         if (ProductDetail.product.updatedList && ProductDetail.product.updatedList.length > 0) {



      //           // Find the latest update from updatedList
      //           const latestUpdate = ProductDetail.product.product.updatedList.reduce((latest, current) => {
      //             return new Date(current.date) > new Date(latest.date) ? current : latest;
      //           });

      //           // Update the product array
      //           ProductDetail.product.product.product = ProductDetail.product.product.product.map(item => {
      //             if (item.shopName._id === latestUpdate.shopName) {
      //               return {
      //                 ...item,
      //                 price: latestUpdate.price,
      //                 date: latestUpdate.date,
      //               };
      //             }
      //             return item;
      //           });
      //         }

      //         console.log(ProductDetail.updatedList);

      // return

      const ProductDetail = await Model.LightsModel.findById(Product)
        .populate({
          path: "product.shopName",
          model: "Store",
        })
        .populate("BrandID")
        .populate("productUnitId");

      // if (ProductDetail?.updatedList?.length > 0 && Array.isArray(ProductDetail.product)) {
      //   const updatesByShop = {};

      //   // Group updates by shopName and keep the latest one per shop
      //   ProductDetail.updatedList.forEach(update => {
      //     const shopId = update.shopName?.toString(); // In case it's not populated
      //     if (!shopId) return;

      //     const currentDate = new Date(update.date);
      //     const existingUpdate = updatesByShop[shopId];
      //     if (!existingUpdate || currentDate > new Date(existingUpdate.date)) {
      //       updatesByShop[shopId] = update;
      //     }
      //   });

      //   // Apply updates to product array
      //   ProductDetail.product = ProductDetail.product.map(item => {
      //     const shopId = item.shopName?._id?.toString();
      //     if (shopId && updatesByShop[shopId]) {
      //       const update = updatesByShop[shopId];
      //       return {
      //         ...item,
      //         price: update.price,
      //         date: update.date,
      //       };
      //     }
      //     return item;
      //   });
      // }


      // console.log(ProductDetail.product); // See the final modified product array
      // return;



      const productCount = ProductDetail.product.length;

      const Producthistory = await Model.LightsModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(Product) },
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "stores",
            localField: "product.shopName",
            foreignField: "_id",
            as: "product.shopName",
          },
        },
        {
          $unwind: "$product.shopName",
        },
        {
          $sort: { "product.price": 1 },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            lowestPriceProduct: { $first: "$product" },
            highestPriceProduct: { $last: "$product" },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            lowestPriceProduct: 1,
            highestPriceProduct: 1,
          },
        },
      ]);

      if (!ProductDetail) {
        let message = "Product not found";
        if (req.headers.language_type == "ar") {
          message = "القائمة فارغة";
        }

        return helper.failed(res, message);
      }
      const similarProducts = await Model.LightsModel.find({
        categoryNames: ProductDetail.categoryNames,
        _id: { $ne: ProductDetail },
      })
        .populate("BrandID")
        .populate("productUnitId");

      const Comments = await Model.commentsModel
        .find({ ProductID: Product })
        .populate({ path: "userId", select: "name image" });

      let notifyme = null;
      if (user) {
        notifyme = await Model.UserModel.findById(user)
          .select("Notifyme")
          .lean();
      }

      return helper.success(res, "", {
        product: ProductDetail,
        // Dateproduct: ProductDetail.product,
        Like: likeValue,
        OfferCount: productCount,
        similarProducts: similarProducts,
        comments: Comments,
        pricehistory: Producthistory,
        averageRating: averageRating,
        ratingCount: ratingCount,
        notifyme,
      });
    } catch (error) {
      console.log(error, "Something went wrong");
      return helper.failed(res, "Something went wrong");
    }
  },
  similarProducts: async (req, res) => {
    try {
      const Product = new mongoose.Types.ObjectId(req.query.id);
      const ProductDetail = await Model.LightsModel.findById(Product).populate({
        path: "product.shopName",
        model: "Store",
      });

      const similarProducts = await Model.LightsModel.find({
        categoryNames: ProductDetail.categoryNames,
        _id: { $ne: ProductDetail },
      }).populate("productUnitId");

      return helper.success(res, "", similarProducts);
    } catch (error) {
      console.log(error, "Somethimg Went Wrong");
    }
  },
  DealListing: async (req, res) => {
    try {
      const categoryData = await Model.DealModel.find({
        deleted: false,
      }).populate("StoreId");
      if (!categoryData) {
        return helpers.failed(res, "not ");
      }
      return helpers.success(res, "Deals", categoryData);
    } catch (error) {
      console.log(error);
    }
  },
  ProductLike: async (req, res) => {
    try {
      const userId = req.user._id;
      const productId = req.body.ProductID;

      const existingLike = await LikeModel.findOne({
        userId: userId,
        ProductID: productId,
      });

      if (existingLike) {
        if (existingLike.status === 1) {
          // If currently liked, delete the like
          await LikeModel.deleteOne({ _id: existingLike._id });
          return helpers.success(res, "Like removed successfully");
        } else {
          existingLike.status = 1;
          await existingLike.save();
          return helpers.success(res, "Like added successfully", existingLike);
        }
      } else {
        // Create a new like if none exists
        const newLike = await LikeModel.create({
          userId: userId,
          ProductID: productId,
          status: 1,
        });
        return helpers.success(res, "Like added successfully", newLike);
      }
    } catch (error) {
      console.log(error, "Something went wrong");
      return helpers.failed(res, "An error occurred");
    }
  },
  ProductLike_list: async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user._id);

      let LikeList = await LikeModel.find({
        userId: userId,
        status: 1,
      }).populate({
        path: "ProductID",
      });

      if (LikeList.length > 0) {
        return helpers.success(res, "Likes retrieved successfully", LikeList);
      } else {
        return helpers.arraysuccess(res, "No likes found");
      }
    } catch (error) {
      console.log("Something went wrong:", error);
      return helpers.failed(res, "An error occurred while fetching likes");
    }
  },
  BarCodeDetail: async (req, res) => {
    try {
      const { barcode } = req.query;

      if (!barcode) {
        return helper.failed(res, "Barcode is required");
      }

      const Product = await Model.LightsModel.findOne({ BarCode: barcode })
        .populate({
          path: "product.shopName",
          model: "Store",
        })
        .populate("BrandID")
        .populate("productUnitId");

      if (!Product) {
        return helper.success(res, "This BarCode Is Not Exist");
      }
      let user = req.user ? req.user._id : null;

      const Like = await LikeModel.findOne({
        userId: user,
        ProductID: Product,
      });

      const likeValue = Like ? 1 : 0;

      const ratings = await Model.ratingModel.find({ ProductID: Product });
      let ratingCount;
      ratingCount = ratings.length ? ratings.length : 0;

      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
          ratings.length
          : 0;

      const allStore = await StoreModel.find();
      const ProductDetail = await Model.LightsModel.findById(Product)
        .populate({
          path: "product.shopName",
          model: "Store",
        })
        .populate("BrandID")
        .populate("productUnitId");

      const productCount = ProductDetail.product.length;

      const Producthistory = await Model.LightsModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(Product) }, // Match the product by its ID
        },
        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "stores",
            localField: "product.shopName",
            foreignField: "_id",
            as: "product.shopName",
          },
        },
        {
          $unwind: "$product.shopName",
        },
        {
          $sort: { "product.price": 1 },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            lowestPriceProduct: { $first: "$product" },
            highestPriceProduct: { $last: "$product" },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            lowestPriceProduct: 1,
            highestPriceProduct: 1,
          },
        },
      ]);

      if (!ProductDetail) {
        let message = "Product not found";
        if (req.headers.language_type == "ar") {
          message = "القائمة فارغة";
        }

        return helper.failed(res, message);
      }
      const similarProducts = await Model.LightsModel.find({
        categoryNames: ProductDetail.categoryNames,
        _id: { $ne: ProductDetail },
      });

      const Comments = await Model.commentsModel
        .find({ ProductID: Product })
        .populate({ path: "userId", select: "name image" });

      let notifyme = null;
      if (user) {
        notifyme = await Model.UserModel.findById(user)
          .select("Notifyme")
          .lean();
      }

      return helper.success(res, "", {
        product: ProductDetail,
        Like: likeValue,
        OfferCount: productCount,
        similarProducts: similarProducts,
        comments: Comments,
        pricehistory: Producthistory,
        averageRating: averageRating,
        ratingCount: ratingCount,
        notifyme,
      });
    } catch (error) {
      console.log(error, "Something went wrong");
      return helper.failed(res, "Something went wrong");
    }
  },
  
};
