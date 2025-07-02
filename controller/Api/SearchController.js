const SearchModel = require("../../Model/SearchModel");
const translate = require("translate-google");
const langdetect = require("langdetect");
const helper = require("../../utility/helper");
const mongoose = require("mongoose");
const { CategoryModel } = require("../../Model/Index");
const StoreModel = require("../../Model/StoreModel");
const BrandModel = require("../../Model/BrandModel");
const Model = require("../../Model/Index");

function updateBrand() {
  let arr = []
}
updateBrand()

module.exports = {
  CreateSerach: async (req, res) => {
    try {
      let UserId = req.user?._id;
      if (!UserId) {
        return helper.failed(res, "User not authenticated");
      }

      var body_text = req.body?.name;
      if (!body_text || typeof body_text !== "string") {
        return helper.failed(res, "Invalid category name");
      }

      const detectLanguage = async (text) => {
        if (!text || typeof text !== "string") return "Unknown Language";
        return langdetect.detectOne(text) || "Unknown Language";
      };

      let title_1 = "";
      let title_2 = "";
      let detectedLang = await detectLanguage(body_text);

      if (detectedLang === "ar") {
        title_1 = await translate(body_text, { from: "ar", to: "en" });
        title_2 = body_text;
      } else {
        title_1 = body_text;
        title_2 = await translate(body_text, { from: "en", to: "ar" });
      }

      const searchEntry = await SearchModel.create({
        userId: UserId,
        name: title_1,
        nameArabic: title_2,
      });

      const searchEntry1 = await SearchModel.find({
        _id: searchEntry._id,
      }).lean();

      if (!searchEntry1) {
        return helper.failed(res, "Failed to create search entry");
      }

      return helper.success(res, "Created Successfully", searchEntry1);
    } catch (error) {
      console.error("Error in CreateSerach:", error);
      return helper.failed(res, "Something went wrong");
    }
  },

  SearchList: async (req, res) => {
    try {
      const userId = req.user._id;
      const SerachList = await SearchModel.find({ userId: userId });
      if (SerachList.length === 0) {
        return helper.success(res, "list empty",SerachList);
      }
      return helper.success(res, "Get List", SerachList);
    } catch (error) {
      console.log(error, "Somthing Went Wrong");
    }
  },

  SerachDelete: async (req, res) => {
    try {
      const userId = req.user._id;

      if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
        return helper.failed(res, "Invalid ID format");
      }
      const SerachDelete = await SearchModel.findByIdAndDelete(
        {
          userId: userId,
          _id: new mongoose.Types.ObjectId(req.body.id),
        },
        { new: true }
      );
      if (!SerachDelete) {
        return helper.failed(res, " not Delete ");
      }
      return helper.success(res, "deleted", SerachDelete);
    } catch (error) {
      console.log(error, "Somthing Went Wrong");
    }
  },

  ApplyFilletr: async (req, res) => {
    try {
      const { longitude, latitude } = req.query;

      const categoryData = await CategoryModel.aggregate([
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
      ]);

      const store = await StoreModel.find();
      const brand = await BrandModel.find();
      return helper.success(res, "", {
        Category: categoryData,
        store: store,
        brand: brand,
      });
    } catch (error) {
      console.log(error, "something went wrong");
    }
  },

  //  searchFilter:  async (req, res) => {
  //   try {
  //     const { categoryId, brandId, storeId, searchTerm, longitude, latitude } = req.query;
  //     let userId = req.user?._id;

  //     if (searchTerm) {
  //       const { title_1, title_2 } = await helper.translateText(searchTerm);
  //       await SearchModel.create({
  //         userId,
  //         name: title_1,
  //         nameArabic: title_2,
  //       });
  //     }

  //     if (!longitude || !latitude) {
  //       return res.status(400).json({ message: "Longitude and latitude are required" });
  //     }

  //     const parsedLongitude = parseFloat(longitude);
  //     const parsedLatitude = parseFloat(latitude);

  //     if (isNaN(parsedLongitude) || isNaN(parsedLatitude)) {
  //       return res.status(400).json({ message: "Invalid longitude or latitude" });
  //     }

  //     let filters = {};
  //     let categoryFilters = {};

  //     if (categoryId && mongoose.Types.ObjectId.isValid(categoryId.trim())) {
  //       filters.categoryNames = new mongoose.Types.ObjectId(categoryId.trim());
  //     }
  //     if (brandId && mongoose.Types.ObjectId.isValid(brandId.trim())) {
  //       filters.BrandID = new mongoose.Types.ObjectId(brandId.trim());
  //     }
  //     if (storeId && mongoose.Types.ObjectId.isValid(storeId.trim())) {
  //       filters["product.shopName"] = new mongoose.Types.ObjectId(storeId.trim());
  //     }

  //     if (!categoryId && !brandId && !storeId) {
  //       filters = {};
  //     }

  //     if (searchTerm) {
  //       filters.$or = [
  //         { name: { $regex: new RegExp(searchTerm, "i") } },
  //         { nameArabic: { $regex: new RegExp(searchTerm, "i") } },
  //       ];

  //       categoryFilters.$or = [
  //         { categoryName: { $regex: new RegExp(searchTerm, "i") } },
  //         { categoryNameArabic: { $regex: new RegExp(searchTerm, "i") } }
  //       ];
  //     }

  //     const categoryAggregate = [
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
  //     ];

  //     if (Object.keys(categoryFilters).length > 0) {
  //       categoryAggregate.push({ $match: categoryFilters });
  //     }

  //     const categoryData = await Model.CategoryModel.aggregate(categoryAggregate);
  //     const products = await Model.LightsModel.find(filters)
  //     .populate("categoryNames", "categoryName categoryNameArabic")
  //     .populate("product.shopName", "shopName")
  //     .populate("BrandID", "name");

  //       if (searchTerm) {
  //         const filteredProducts = products.filter(
  //           (product) =>
  //             product.BrandID?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //             product.categoryNames?.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //             product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //             product.nameArabic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //             product.product?.some((p) =>
  //               p.shopName?.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
  //             )
  //         );
  //       if (!categoryData.length && !filteredProducts.length) {
  //         return helper.failed(res, "No matching records found");
  //       }

  //       return helper.success(res, "Search results", { Categories: categoryData, Products: filteredProducts });
  //     }

  //     if (!categoryData.length && !products.length) {
  //       return helper.failed(res, "No matching records found");
  //     }

  //     return helper.success(res, "Search results", { Categories: categoryData, Products: products });
  //   } catch (error) {
  //     console.error("Error in searchFilter:", error);
  //     return res.status(500).json({ message: "Something went wrong" });
  //   }
  // },

  searchFilter: async (req, res) => {
    try {
      const { categoryId, brandId, storeId, searchTerm, longitude, latitude } =
        req.query;
      let userId = req.user?._id;

      if (searchTerm) {
        const { title_1, title_2 } = await helper.translateText(searchTerm);
        await SearchModel.create({
          userId,
          name: title_1,
          nameArabic: title_2,
        });
      }

 
      const parsedLongitude = parseFloat(longitude);
      const parsedLatitude = parseFloat(latitude);

   
      let filters = {};
      let categoryFilters = {};

      // Convert IDs into arrays
      const categoryIds = categoryId
        ? categoryId.split(",").map((id) => id.trim())
        : [];
      const brandIds = brandId ? brandId.split(",").map((id) => id.trim()) : [];
      const storeIds = storeId ? storeId.split(",").map((id) => id.trim()) : [];

      if (categoryIds.length) {
        filters["categoryNames._id"] = {
          $in: categoryIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
      if (brandIds.length) {
        filters["BrandID._id"] = {
          $in: brandIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }
      if (storeIds.length) {
        filters["shopName._id"] = {
          $in: storeIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      if (searchTerm) {
        filters.$or = [
          { name: { $regex: new RegExp(searchTerm, "i") } },
          { nameArabic: { $regex: new RegExp(searchTerm, "i") } },
          { "BrandID.Brandname": { $regex: new RegExp(searchTerm, "i") } }, 
          { "categoryNames.categoryName": { $regex: new RegExp(searchTerm, "i") } }, // Searching inside populated field
          { "shopName.name": { $regex: new RegExp(searchTerm, "i") } }, // Searching inside populated field
          { "shopName.nameArabic": { $regex: new RegExp(searchTerm, "i") } }
        ]

        categoryFilters.$or = [
          { categoryName: { $regex: new RegExp(searchTerm, "i") } },
          { categoryNameArabic: { $regex: new RegExp(searchTerm, "i") } },
        ];
      }


      // console.log(filters);return
      

      const categoryAggregate = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [parsedLongitude, parsedLatitude],
            },
            distanceField: "distance",
            spherical: true,
            maxDistance: 3000,
            key: "location.coordinates",
          },
        },
      ];

      if (Object.keys(categoryFilters).length > 0) {
        categoryAggregate.push({ $match: categoryFilters });
      }

      const categoryData = await Model.CategoryModel.aggregate(
        categoryAggregate
      );
      // const products = await Model.LightsModel.find(filters)
      //   .populate("categoryNames", "categoryName categoryNameArabic")
      //   .populate({
      //     path: "product.shopName",
      //     model: "Store",
      //   })
      //   .populate("BrandID", "Brandname");
      const products = await Model.LightsModel.aggregate([
        {
          $lookup: {
            from: "brands", // Collection name of the Brand model
            localField: "BrandID",
            foreignField: "_id",
            as: "BrandID"
          }
        },
        {
          $lookup: {
            from: "categories", // Collection name of the Brand model
            localField: "categoryNames",
            foreignField: "_id",
            as: "categoryNames"
          }
        },
        {
          $unwind: "$categoryNames"
        },
        {
          $unwind: "$BrandID"
        },
        {
          $lookup: {
            from: "stores", // Collection name of the Brand model
            localField: "product.shopName",
            foreignField: "_id",
            as: "shopName"
          }
        },
        // {
        //   $unwind: "$shopName"
        // },
        {
          $match: filters
        }
      ]);
     
      // if (searchTerm) {
      //   const filteredProducts = products.filter(
      //     (product) =>
      //       product.BrandID?.Brandname
      //         ?.toLowerCase()
      //         .includes(searchTerm.toLowerCase()) ||
      //       product.categoryNames?.categoryName
      //         ?.toLowerCase()
      //         .includes(searchTerm.toLowerCase()) ||
      //       product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      //       product.nameArabic
      //         ?.toLowerCase()
      //         .includes(searchTerm.toLowerCase()) ||
      //       product.product?.some((p) =>
      //         p.shopName?.shopName
      //           ?.toLowerCase()
      //           .includes(searchTerm.toLowerCase())
      //       )
      //   );

      //   if (!categoryData.length && !filteredProducts.length) {
      //     return helper.success(res, "No matching records found");
      //   }

      //   return helper.success(res, "Search results", {
      //     Categories: categoryData,
      //     Products: filteredProducts,
      //   });
      // }

      if (!categoryData.length && !products.length) {
        return helper.success(res, "No matching records found");
      }

      return helper.success(res, "Search results", {
        Categories: categoryData,
        Products: products,
      });
    } catch (error) {
      console.error("Error in searchFilter:", error);
      return res.status(500).json({ message: "Something went wrong" });
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
  //         $or: [
  //           { categoryName: { $regex: new RegExp(categoryName, "i") } },
  //           { categoryNameArabic: { $regex: new RegExp(categoryName, "i") } },
  //         ],
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

  //     let productFilter = {
  //       categoryNames: await Model.CategoryModel.findOne({
  //         $or: [
  //           { categoryName: { $regex: new RegExp(categoryName, "i") } },
  //           { categoryNameArabic: { $regex: new RegExp(categoryName, "i") } },
  //         ],
  //       }).select("_id"),
  //     };

  //     let shopIds = [];
  //     if (categoryName) {
  //       const shops = await StoreModel.find({
  //         $or: [
  //           { name: { $regex: new RegExp(categoryName, "i") } },
  //           { nameArabic: { $regex: new RegExp(categoryName, "i") } },
  //         ],
  //       }).select("_id");
  //       shopIds = shops.map((shop) => shop._id);
  //     }

  //     const products = await Model.LightsModel.find({
  //       $or: [
  //         { name: { $regex: new RegExp(categoryName, "i") } },
  //         { nameArabic: { $regex: new RegExp(categoryName, "i") } },
  //         { Brandname: { $regex: new RegExp(categoryName, "i") } },
  //         { BrandnameArabic: { $regex: new RegExp(categoryName, "i") } },
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
};
