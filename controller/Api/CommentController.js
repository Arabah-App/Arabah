const Model = require("../../Model/Index");
const helper = require("../../utility/helper");

module.exports = {
  CreateComment: async (req, res) => {
    try {
      const { title_1, title_2 } = await helper.translateText(
        req.body.comment
      );
      const Comment = await Model.commentsModel.create({
        userId: req.user._id,
        ProductID: req.body.ProductID,
        comment:title_1,
        commentArabic:title_2,

      });
            let AppMESSAGE;

            AppMESSAGE = await helper.lang(
              req.headers.language_type,
              "Created Comment"
            );
      return helper.success(res, AppMESSAGE, Comment);
    } catch (error) {
      console.log(error, "Somthing Went Wrong");
    }
  },
  CommentList: async (req, res) => {
    try {
      const Comment = await Model.commentsModel.create({
        userId: req.user._id,
        ProductID: req.body.ProductID,

});
            let AppMESSAGE;

            AppMESSAGE = await helper.lang(
              req.headers.language_type,
              " Comment list"
            );
      return helper.success(res, AppMESSAGE, Comment);
    } catch (error) {
      console.log(error, "Somthing Went Wrong");
    }
  },
};
