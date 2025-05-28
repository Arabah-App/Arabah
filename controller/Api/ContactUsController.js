const Model = require("../../Model/Index.js");
const helper = require("../../utility/helper.js");
const helpers = require("../../utility/helpers");

module.exports = {
  CraeteContact: async (req, res) => {
    try {
      let contact = await Model.ContactModel.create({
        userId: req.user._id,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        countryCode: req.body.countryCode,
        message: req.body.message,
        
      });
      if (!contact) {
        let AppMESSAGE;

        AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "Conatct Not  created"
        );
        return helpers.failed(AppMESSAGE);
      }
      let AppMESSAGE;

      AppMESSAGE = await helper.lang(
        req.headers.language_type,
        "contact created"
      );
      return helpers.success(res, AppMESSAGE, contact);
    } catch (error) {
      console.log(error, "Somthing went Wrong");
    }
  },
};
