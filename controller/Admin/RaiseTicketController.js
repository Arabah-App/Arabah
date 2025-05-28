const Model = require("../../Model/Index");
const helper = require("../../utility/helper");

module.exports = {
  RaiseList: async (req, res) => {
    try {
      let title = "RaiseList";
      const RaiseList = await Model.raisemodel
        .find({ deleted: false })
        .populate("userId");
      console.log(RaiseList, "RaiseListRaiseListRaiseList");
      res.render("Admin/RasiedTicket/RasiedTicket", {
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
  viewRaise: async (req, res) => {
    try {
      const activitydetail = await Model.raisemodel.findById({
        _id: req.params.id,
      });

      res.render("Admin/RasiedTicket/viewTicket.ejs", {
        title: "RaiseList",

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
