const cmsModel = require("../../Model/cmsModel");
const helper = require("../../utility/helper");
const Model = require("../../Model/Index");

module.exports = {
  addCms: async (req, res) => {
    try {
      await Model.CmsModel.create({
        title: req.body.title,
        description: req.body.description,
        role: req.body.type,
      });
      return helper.success(res, "CMS added successfully");
    } catch (error) {
      console.log(error);
    }
  },

  aboutUs: async (req, res) => {
    try {
      let title = "aboutUs";
      const aboutUsData = await Model.CmsModel.findOne({ type: 1 });
      res.render("Admin/cms/aboutUs", {
        title,
        aboutUsData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  Arabicaboutus: async (req, res) => {
    try {
      let title = "aboutUs";
      const aboutUsData = await Model.CmsModel.findOne({ type: 1 });
      res.render("Admin/cms/Arabicaboutus.ejs", {
        title,
        aboutUsData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  privacyPolicy: async (req, res) => {
    try {
      let title = "privacyPolicy";
      const policyData = await Model.CmsModel.findOne({ type: 2 });
      res.render("Admin/cms/privacyPolicy", {
        title,
        policyData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  Arabicprivacy: async (req, res) => {
    try {
      let title = "privacyPolicy";
      const policyData = await Model.CmsModel.findOne({ type: 2 });
      res.render("Admin/cms/Arabicprivacy.ejs", {
        title,
        policyData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  termsConditions: async (req, res) => {
    try {
      let title = "termsConditions";
      const termsData = await Model.CmsModel.findOne({ type: 3 });

      res.render("Admin/cms/termsConditions", {
        title,
        termsData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  arabictermsConditions: async (req, res) => {
    try {
      let title = "termsConditions";
      const termsData = await Model.CmsModel.findOne({ type: 3 });

      res.render("Admin/cms/arabict&condition.ejs", {
        title,
        termsData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  updatecms: async (req, res) => {
    try {
      await Model.CmsModel.updateOne(
        { _id: req.body.id },
        {
          type: req.body.type,

          description: req.body.description,
        }
      );
      res.redirect("back");
    } catch (error) {
      console.log(error);
    }
  },
  updatearabic: async (req, res) => {
    try {
      await Model.CmsModel.updateOne(
        { _id: req.body.id },
        {
          type: req.body.type,

          descriptionArabic: req.body.descriptionArabic,
        }
      );
      res.redirect("back");
    } catch (error) {
      console.log(error);
    }
  },
};
