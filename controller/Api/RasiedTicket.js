const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const helpers = require("../../utility/helpers");

module.exports = {
  createTicket: async (req, res) => {
    try {
      const { Title, Description } = await helper.translateTextmultiple2(
        req.body.Title,
        req.body.Description
      );
      
      let userId = req.user._id;
      
      let ticket = await Model.raisemodel.create({
        userId: userId,
        Title: Title.title_1,
        TitleArabic: Title.title_2,
        Description: Description.title_1,
        DescriptionArabic: Description.title_2, 
      });
      
      if (!ticket) {
        let AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "Ticket Not Created"
        );
        return helpers.failed(res, AppMESSAGE, {});
      }
      
      let AppMESSAGE = await helper.lang(
        req.headers.language_type,
        "Ticket Created"
      );
      return helpers.success(res, AppMESSAGE, ticket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      return res.status(500).json({ message: "Internal Server Error" }); // Added error response
    }
  },

  TicketList: async (req, res) => {
    try {
      let userId2 = req.user._id;

      const RaiseList = await Model.raisemodel.find({
        userId: req.user._id,
      });
      if (!RaiseList) {
        let AppMESSAGE;

        AppMESSAGE = await helper.lang(
          req.headers.language_type,
          "No More Tickets"
        );
        return helpers.failed(res, AppMESSAGE, {});
      }

      return helpers.success(res, "", RaiseList);
    } catch (error) {
      console.log(error);
    }
  },
};
