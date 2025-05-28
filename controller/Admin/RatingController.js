const Model = require("../../Model/Index");
const helper = require("../../utility/helper");

module.exports = {
  ratingList: async (req, res) => {
    try {
      let title = "rating";
      const ratingData = await Model.ratingModel
        .find({ deleted: false })
        .populate([
          { path: "userId", model: "User" },
          { path: "ProductID", model: "light" },
        ]);
      console.log("🚀 ~ CommentList: ~ commentsData:", ratingData);

      res.render("Admin/rating/ratingList", {
        title,
        ratingData,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  editrating: async (req, res) => {
    try {
    
      const activitydetail = await Model.ratingModel
        .findById({
          _id: req.params.id,
        })
        .populate([
          { path: "userId", model: "User" },
          { path: "ProductID", model: "light" },
        ]);
      res.render("Admin/rating/ratingView.ejs", {
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
};
