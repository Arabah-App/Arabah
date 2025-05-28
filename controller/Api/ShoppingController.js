const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const mongoose = require("mongoose");
const StoreModel = require("../../Model/StoreModel");

module.exports = {
  AddtoShoppinglist: async (req, res) => {
    try {
      let existingItem = await Model.ShoppingModel.findOne({
        userId: req.user._id,
        ProductID: req.body.productId,
      });

      if (existingItem) {
        let message = "This product is already in your shopping list";
        if (req.headers.language_type == "ar") {
          message = "هذا المنتج موجود بالفعل في قائمة التسوق الخاصة بك";
        }
        return helper.failed(res, message);
      }

      let addShopping = await Model.ShoppingModel.create({
        userId: req.user._id,
        ProductID: req.body.productId,
      });

      let message = "Product Add to Shopping List Successfully";
      if (req.headers.language_type == "ar") {
        message = "تم إضافة المنتج إلى قائمة التسوق بنجاح";
      }
      return helper.success(res, message, addShopping);
    } catch (error) {
      console.log(error, "Somthing went Wrong");
    }
  },

  // ShoppingList: async (req, res) => {
  //   try {
  //     const allStore = await StoreModel.find();

  //     let ShoppingList = await Model.ShoppingModel.find({
  //       userId: req.user._id,
  //     })
  //       .populate({
  //         path: "ProductID",
  //         populate: [
  //           {
  //             path: "product.shopName",
  //             model: "Store",
  //           },
  //         ],
  //       })
  //       .lean();

  //     ShoppingList = ShoppingList.map((item) => {
  //       if (
  //         item.ProductID &&
  //         item.ProductID.product &&
  //         Array.isArray(item.ProductID.product) &&
  //         item.ProductID.product.length > 0
  //       ) {
  //         item.ProductID.product = item.ProductID.product.sort((a, b) => {
  //           if (a.shopName._id < b.shopName._id) return -1;
  //           if (a.shopName._id > b.shopName._id) return 1;
  //           return 0;
  //         });

  //         item.ProductID.product = item.ProductID.product.map((prod) => ({
  //           ...prod,
  //           name: item.ProductID.name,
  //           nameArabic: item.ProductID.nameArabic,
  //         }));
  //       }

  //       return item;
  //     });
  //     console.log(ShoppingList, "nameArabicnameArabic");

  //     if (!ShoppingList || ShoppingList.length === 0) {
  //       const AppMESSAGE = await helper.lang(
  //         req.headers.language_type,
  //         "Shopping List is not get"
  //       );
  //       return helper.success(res, AppMESSAGE);
  //     }

  //     let shopSummary = [];

  //     ShoppingList.forEach((item) => {
  //       if (item.ProductID.product) {
  //         item.ProductID.product.forEach((prod) => {
  //           let shop = shopSummary.find((s) => s.shopId === prod.shopName._id);

  //           if (shop) {
  //             shop.totalPrice += prod.price;
  //           } else {
  //             shopSummary.push({
  //               shopId: prod.shopName._id,
  //               shopName: prod.shopName.name,
  //               nameArabic: prod.shopName.nameArabic,
  //               totalPrice: prod.price,
  //             });
  //           }
  //         });
  //       }
  //     });

  //     ShoppingList.forEach((item) => {
  //       if (item.ProductID && Array.isArray(item.ProductID.product)) {
  //         allStore.forEach((store) => {
  //           const storeExists = item.ProductID.product.some(
  //             (prod) => prod.shopName._id.toString() === store._id.toString()
  //           );

  //           if (!storeExists) {
  //             item.ProductID.product.push({
  //               shopName: {
  //                 _id: store._id,
  //                 name: store.name,
  //                 nameArabic: store.nameArabic,

  //                 image: store.image || "",
  //               },
  //               price: 0,
  //               Location: "",
  //               date: new Date(),
  //             });
  //           }
  //         });

  //         item.ProductID.product = item.ProductID.product.sort((a, b) => {
  //           if (a.shopName._id < b.shopName._id) return -1;
  //           if (a.shopName._id > b.shopName._id) return 1;
  //           return 0;
  //         });
  //       }
  //     });

  //     const AppMESSAGE = await helper.lang(
  //       req.headers.language_type,
  //       "Shopping List"
  //     );
  //     return helper.success(res, AppMESSAGE, { ShoppingList, shopSummary });
  //   } catch (error) {
  //     console.log(error, "Something went wrong");
  //     return helper.failed(
  //       res,
  //       "An error occurred while fetching the shopping list."
  //     );
  //   }
  // },
  ShoppingList: async (req, res) => {
    try {
      const allStore = await StoreModel.find();

      let ShoppingList = await Model.ShoppingModel.find({
        userId: req.user._id,
      })
        .populate({
          path: "ProductID",
          populate: [
            {
              path: "productUnitId",
              model: "ProdiuctUnit",
            },
          ],
          populate: [
            {
              path: "BrandID",
              model: "Brand",
            },
          ],
        })
        .populate({
          path: "ProductID",
          populate: [
            {
              path: "product.shopName",
              model: "Store",
            },
          ],
        })
        .lean();
      ShoppingList = ShoppingList.filter((item) => item.ProductID !== null);

      ShoppingList = ShoppingList.map((item) => {
        if (
          item.ProductID &&
          item.ProductID.product &&
          Array.isArray(item.ProductID.product) &&
          item.ProductID.product.length > 0
        ) {
          item.ProductID.product = item.ProductID.product.sort((a, b) => {
            return a.shopName._id
              .toString()
              .localeCompare(b.shopName._id.toString());
          });

          item.ProductID.product = item.ProductID.product.map((prod) => ({
            ...prod,
            name: item.ProductID.name,
            nameArabic: item.ProductID.nameArabic,
          }));
        }
        return item;
      });

      console.log(ShoppingList, "nameArabicnameArabic");

      if (!ShoppingList || ShoppingList.length === 0) {
        const AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "Shopping List is not get"
        );
        return helper.success(res, AppMESSAGE);
      }

      let shopSummary = [];

      // Calculate shop summary with total price
      ShoppingList.forEach((item) => {
        if (item.ProductID.product) {
          item.ProductID.product.forEach((prod) => {
            let shop = shopSummary.find(
              (s) => s.shopId.toString() === prod.shopName._id.toString()
            );

            if (shop) {
              shop.totalPrice += prod.price;
            } else {
              shopSummary.push({
                shopId: prod.shopName._id,
                shopName: prod.shopName.name,
                nameArabic: prod.shopName.nameArabic,
                totalPrice: prod.price,
              });
            }
          });
        }
      });

      // Ensure all stores exist in shopSummary, even if their total price is 0
      allStore.forEach((store) => {
        let shopExists = shopSummary.some(
          (s) => s.shopId.toString() === store._id.toString()
        );

        if (!shopExists) {
          shopSummary.push({
            shopId: store._id,
            shopName: store.name,
            nameArabic: store.nameArabic,
            totalPrice: 0, // Default price when no product exists
          });
        }
      });

      // Sort shopSummary by shopId to maintain order
      shopSummary.sort((a, b) => (a.shopId < b.shopId ? -1 : 1));

      // Add missing stores in ShoppingList with default values
      ShoppingList.forEach((item) => {
        if (item.ProductID && Array.isArray(item.ProductID.product)) {
          allStore.forEach((store) => {
            const storeExists = item.ProductID.product.some(
              (prod) => prod.shopName._id.toString() === store._id.toString()
            );

            if (!storeExists) {
              item.ProductID.product.push({
                shopName: {
                  _id: store._id,
                  name: store.name,
                  nameArabic: store.nameArabic,
                  image: store.image || "",
                },
                price: 0,
                Location: "",
                date: new Date(),
              });
            }
          });

          // Sort again after adding missing stores
          item.ProductID.product.sort((a, b) =>
            a.shopName._id.toString().localeCompare(b.shopName._id.toString())
          );
        }
      });

      const AppMESSAGE = await helper.lang(
        req.headers.language_type,
        "Shopping List"
      );
      return helper.success(res, AppMESSAGE, { ShoppingList, shopSummary });
    } catch (error) {
      console.log(error, "Something went wrong");
      return helper.failed(
        res,
        "An error occurred while fetching the shopping list."
      );
    }
  },
  // ShoppingList: async (req, res) => {
  //   try {
  //     const allStore = await StoreModel.find();

  //     let ShoppingList = await Model.ShoppingModel.find({
  //       userId: req.user._id,
  //     })
  //       .populate({
  //         path: "ProductID",
  //         populate: [
  //           {
  //             path: "productUnitId",
  //             model: "ProdiuctUnit",
  //           },
  //         ],
  //         populate: [
  //           {
  //             path: "BrandID",
  //             model: "Brand",
  //           },
  //         ],
  //       })
  //       .populate({
  //         path: "ProductID",
  //         populate: [
  //           {
  //             path: "product.shopName",
  //             model: "Store",
  //           },
  //         ],
  //       });

  //     ShoppingList = ShoppingList.filter((item) => item.ProductID !== null);

  //     if (ShoppingList.length === 0) {
  //       const AppMESSAGE = await helper.lang(
  //         req.headers.language_type,
  //         "No items found in the shopping list."
  //       );
  //       return helper.success(res, AppMESSAGE, {
  //         ShoppingList: [],
  //         shopSummary: [],
  //       });
  //     }
  //     // Sort and update product details
  //     ShoppingList = ShoppingList.map((item) => {
  //       if (
  //         item.ProductID &&
  //         item.ProductID.product &&
  //         Array.isArray(item.ProductID.product) &&
  //         item.ProductID.product.length > 0
  //       ) {
  //         item.ProductID.product = item.ProductID.product.sort((a, b) => {
  //           return a.shopName._id
  //             .toString()
  //             .localeCompare(b.shopName._id.toString());
  //         });

  //         item.ProductID.product = item.ProductID.product.map((prod) => ({
  //           ...prod,
  //           name: item.ProductID.name,
  //           nameArabic: item.ProductID.nameArabic,
  //         }));
  //       }
  //       return item;
  //     });

  //     console.log(ShoppingList, "nameArabicnameArabic");

  //     if (!ShoppingList || ShoppingList.length === 0) {
  //       const AppMESSAGE = await helper.lang(
  //         req.headers.language_type,
  //         "Shopping List is not get"
  //       );
  //       return helper.success(res, AppMESSAGE);
  //     }

  //     let shopSummary = [];

  //     // Calculate shop summary with total price
  //     ShoppingList.forEach((item) => {
  //       if (item.ProductID?.product) {
  //         item.ProductID.product.forEach((prod) => {
  //           let shop = shopSummary.find(
  //             (s) => s.shopId.toString() === prod.shopName._id.toString()
  //           );

  //           if (shop) {
  //             shop.totalPrice += prod.price;
  //           } else {
  //             shopSummary.push({
  //               shopId: prod.shopName._id,
  //               shopName: prod.shopName.name,
  //               nameArabic: prod.shopName.nameArabic,
  //               totalPrice: prod.price,
  //             });
  //           }
  //         });
  //       }
  //     });

  //     // Ensure all stores exist in shopSummary, even if their total price is 0
  //     allStore.forEach((store) => {
  //       let shopExists = shopSummary.some(
  //         (s) => s.shopId.toString() === store._id.toString()
  //       );

  //       if (!shopExists) {
  //         shopSummary.push({
  //           shopId: store._id,
  //           shopName: store.name,
  //           nameArabic: store.nameArabic,
  //           totalPrice: 0, // Default price when no product exists
  //         });
  //       }
  //     });

  //     // Sort shopSummary by shopId to maintain order
  //     shopSummary.sort((a, b) => (a.shopId < b.shopId ? -1 : 1));

  //     // Add missing stores in ShoppingList with default values
  //     ShoppingList.forEach((item) => {
  //       if (item.ProductID && Array.isArray(item.ProductID.product)) {
  //         allStore.forEach((store) => {
  //           const storeExists = item.ProductID.product.some(
  //             (prod) => prod.shopName._id.toString() === store._id.toString()
  //           );

  //           if (!storeExists) {
  //             item.ProductID.product.push({
  //               shopName: {
  //                 _id: store._id,
  //                 name: store.name,
  //                 nameArabic: store.nameArabic,
  //                 image: store.image || "",
  //               },
  //               price: 0,
  //               Location: "",
  //               date: new Date(),
  //             });
  //           }
  //         });

  //         // Sort again after adding missing stores
  //         item.ProductID.product.sort((a, b) =>
  //           a.shopName._id.toString().localeCompare(b.shopName._id.toString())
  //         );
  //       }
  //     });

  //     const AppMESSAGE = await helper.lang(
  //       req.headers.language_type,
  //       "Shopping List"
  //     );
  //     return helper.success(res, AppMESSAGE, { ShoppingList, shopSummary });
  //   } catch (error) {
  //     console.log(error, "Something went wrong");
  //     return helper.failed(
  //       res,
  //       "An error occurred while fetching the shopping list."
  //     );
  //   }
  // },

  ShoppingProduct_delete: async (req, res) => {
    try {
      let Product_Delete = await Model.ShoppingModel.findOneAndDelete(
        {
          userId: req.user._id,
          ProductID: new mongoose.Types.ObjectId(req.body.id),
        },
        { new: true }
      );
      console.log(
        "🚀 ~ ShoppingProduct_delete: ~ Product_Delete:",
        Product_Delete
      );

      if (Product_Delete) {

        return helper.success(res,"");
      }
      return helper.success(res, "not product found");
    } catch (error) {
      console.log(error, "Something went wromg");
    }
  },

  ShoppinglistClear: async (req, res) => {
    try {
      const deletedNotification = await Model.ShoppingModel.find({
        userId: new mongoose.Types.ObjectId(req.user._id),
      });

      if (deletedNotification.length === 0) {
        return helper.success(res, "Notification Empty");
      }

      const idsToDelete = deletedNotification.map(
        (notification) => notification._id
      );

      const alldelete = await Model.ShoppingModel.deleteMany({
        _id: { $in: idsToDelete },
      });

      if (alldelete.deletedCount > 0) {
        return helper.success(res, "Shopping List Clear successfully");
      }
      return helper.success(
        res,
        "Shopping List Clear, but no content available"
      );
    } catch (error) {
      console.error("Something went wrong:", error);
      return helper.failed(
        res,
        "An error occurred while deleting the notifications"
      );
    }
  },
};
