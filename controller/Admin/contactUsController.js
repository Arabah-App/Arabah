const Model = require("../../Model/Index");
const helpers = require("../../utility/helpers");

module.exports = {
  createContactUs: async (req, res) => {
    try {
      const contactus = await Model.ContactModel.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        message: req.body.message,
      });
      res.json(contactus);
    } catch (error) {
      console.log(error);
    }
  },

  contactUsList: async (req, res) => {
    try {
      let title = "contactUsList";
      const contactUsData = await Model.ContactModel.find();
      res.render("Admin/cms/contactUsList", {
        title,
        contactUsData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  viewContactUs: async (req, res) => {
    try {
      let title = "contactUsList";
      const contactUsDetail = await Model.ContactModel.findOne({
        _id: req.params.id,
      });
      res.render("Admin/cms/viewContactUs", {
        title,
        contactUsDetail,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  delete_contact: async (req, res) => {
    try {
      let contactId = req.body.id;
      await Model.ContactModel.deleteOne({ _id: contactId });
      res.redirect("/contactUsList");
    } catch (error) {
      console.log(error);
    }
  },
  contactusStatus: helpers.AsyncHanddle(async (req, res) => {
    await Model.ContactModel.updateOne(
      { _id: req.body.id },
      { status: req.body.value }
    );
    req.flash("msg", "");
    if (req.body.value == 0) res.send(false);
    if (req.body.value == 1) res.send(true);
  }),
};
