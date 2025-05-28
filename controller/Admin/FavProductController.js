const { ShoppingModel, ratingModel } = require("../../Model/Index");
const LikeModel = require("../../Model/LikeModel");
const NotificationModel = require("../../Model/NotificationModel");
const userModel = require("../../Model/userModel");
const helper = require("../../utility/helper");

module.exports = {
  LikeList: async (req, res) => {
    try {
      let title = "LikeList";
      const RaiseList = await LikeModel.find({ status: 1 })
        .populate("userId")
        .populate("ProductID");
      console.log(RaiseList, "RaiseListRaiseListRaiseList");
      res.render("Admin/FavProduct/LikeList", {
        title,
        RaiseList,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  viewLike: async (req, res) => {
    try {
      const activitydetail = await LikeModel.findById({
        _id: req.params.id,
      })
        .populate("userId")
        .populate("ProductID");
      const userData = await userModel.find({ _id: activitydetail.userId });
      const userCount = await userModel
        .find({ _id: activitydetail.userId })
        .countDocuments();
      const Shoppingcount = await ShoppingModel.find({
        ProductID: activitydetail.ProductID,
      }).countDocuments()
      const rating = await ratingModel.find({
        ProductID: activitydetail.ProductID,
      });

let averageRating = 0;

if (rating.length > 0) {
  const total = rating.reduce((sum, r) => sum + r.rating, 0);
  averageRating = total / rating.length;
}
      console.log(userCount, Shoppingcount, averageRating);
      console.log("🚀 ~ viewLike: ~ usersLike:", userData);
      res.render("Admin/FavProduct/viewLike.ejs", {
        title: "LikeList",
        userData,
        userCount,
        rating,
        averageRating,
        activitydetail,
        Shoppingcount,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  notifications: async (req, res) => {
    const { user_ids } = req.body;

    try {
      let title = "Notification";
      if (req.method == "POST") {
   
        // const users = await userModel.find({
        //   _id: {
        //     $in: req.body.user_ids,
        //   },
        // });
        let users = [];

        if (user_ids === "All") {
          // Fetch all users from DB
          users = await userModel.find(
            {},
            "_id deviceToken deviceType name image"
          );
        } else {
          // Send to specific users
          users = await userModel.find(
            { _id: { $in: user_ids } },
            "_id deviceToken deviceType name image"
          );
        }
        const createArr = [];
        for (let index = 0; index < users.length; index++) {
          const element = users[index];
          let obj = {
            description: req.body.message,
            ReciverId: element._id,
            message: req.body.title,
            userId: req.session.user._id,
            type: 3,
          };
          createArr.push(obj);

          helper.send_push_notifications(
            req.body.message,
            element.deviceToken,
            element.deviceType,
            element.name,
            element.image,
            "",
            3,
            req.body.title
          );
        }
        await NotificationModel.insertMany(createArr);
        // return
        req.flash("msg", "Sent successfully");
        return res.redirect("back");
      }
      const list = await userModel.find({
        role: 1,
        status: 1,
      });
      res.render("Admin/Notification/create", {
        title,
        list,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
};
