const Model = require("../../Model/Index");
const helper = require("../../utility/helper");

module.exports = {
  CommentList: async (req, res) => {
    try {
      let title = "comments";
      const commentsData = await Model.commentsModel
        .find({ deleted: false })
        .populate([
          { path: "userId", model: "User" },
          { path: "ProductID", model: "light" },
        ]);
      console.log("🚀 ~ CommentList: ~ commentsData:", commentsData);

      res.render("Admin/comments/CommentsList", {
        title,
        commentsData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  editcommment: async (req, res) => {
    try {
      const activitydetail = await Model.commentsModel
        .findById({
          _id: req.params.id,
        })
        .populate([
          { path: "userId", model: "User" },
          { path: "ProductID", model: "light" },
        ]);
      res.render("Admin/comments/editComments.ejs", {
        title: "",

        activitydetail,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },
};
