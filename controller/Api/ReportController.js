const Model = require("../../Model/Index");
const helper = require("../../utility/helper");

module.exports = {
  ReportCreate: async (req, res) => {
    try {
      let report = await Model.reportModel.create({
        userId: req.user._id,
        ProductID: req.body.ProductID,
        message: req.body.message,
      });
      let AppMESSAGE;

      AppMESSAGE = await helper.lang(
        req.headers.language_type,
        "Report Successfully"
      );
      return helper.success(res, AppMESSAGE, report);
    } catch (error) {
      console.log(error, "SomeThing went Wrong");
    }
  },
};
