const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const helpers = require("../../utility/helpers");

module.exports = {
  reportList: async (req, res) => {
    try {
      let title = "report";
      const reportData = await Model.reportModel
        .find({ deleted: false })
        .populate([
          { path: "userId", model: "User" },
          { path: "ProductID", model: "light" },
        ]);
      console.log("🚀 ~ CommentList: ~ commentsData:", reportData);

      res.render("Admin/report/reportList.ejs", {
        title,
        reportData,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  viewreport: async (req, res) => {

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
      res.render("Admin/report/reportView.ejs", {
        title:"",
        activitydetail,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  ReportStatus: helpers.AsyncHanddle(async (req, res) => {
    await Model.reportModel.updateOne(
      { _id: req.body.id },
      { status: req.body.value }
    );
    req.flash("msg", "ReportStatus updated successfully");
    if (req.body.value == 0) res.send(false);
    if (req.body.value == 1) res.send(true);
  }),
};
