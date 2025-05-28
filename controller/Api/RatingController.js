const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const mongoose = require("mongoose");

module.exports = {
  CreateRating: async (req, res) => {
    try {
      let rating = await Model.ratingModel.create({
        userId: req.user._id,
        ProductID: req.body.ProductID,
        rating: req.body.rating,
        review: req.body.review,
      });
      let AppMESSAGE;

      AppMESSAGE = await helper.lang(
        req.headers.language_type,
        "Rating Successfully"
      );
      return helper.success(res, AppMESSAGE, rating);
    } catch (error) {
      console.log(error, "Something Went Wrong");
    }
  },

  RatingList: async (req, res) => {
    try {
      let ratinglist = await Model.ratingModel.find({
        ProductID: req.query.productId,
      }).populate({path:"userId", select:"name image"})
      let ratingCount = ratinglist.length ?ratinglist.length: 0;

      if (!ratinglist) {
        let AppMESSAGE;

        AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "No rating in this product"
        );
        return helper.failed(res, AppMESSAGE);
      }

      const averageRating =
        ratinglist.reduce((sum, rating) => sum + rating.rating, 0) /
        ratinglist.length;
      let AppMESSAGE;

      AppMESSAGE = await helper.lang(
        req.headers.language_type,
        "rating this product"
      );
      return helper.success(res, AppMESSAGE, {
        ratinglist,
        ratingCount: ratingCount,
        averageRating: averageRating,
      });
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  },
};
  