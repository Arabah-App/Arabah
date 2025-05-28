const helpers = require("../../utility/helpers.js");
const Model = require("../../Model/Index.js");
const joi = require("joi");
const helper = require("../../utility/helper.js");
const translate = require('translate-google')
const langdetect = require("langdetect");
const { hashSync } = require("bcrypt");

module.exports = {
  CMSGet: (async (req, res) => {
    const type = req.query.type;
    const data = await Model.CmsModel.findOne({ type });
    let message = "Cms Get Succesfully"
    if (req.headers.language_type == 'ar') {
      message = " تم الحصول على Cms بنجاح"
    }
    helpers.success(res, message, data);
  }),

  FaqGet: (async (req, res) => {
    const data = await Model.FaqModel.find();
    let message = "Fqa Get Succesfully"
    if (req.headers.language_type == 'ar') {
      message = "الأسئلة الشائعة احصل على النجاح"
    }
    helpers.success(res, message, data);
  }),

  privacyPolicyUrl: async (req, res) => {
    try {

      let data = await Model.CmsModel.findOne({ type: 2 });
      console.log(data,"gfsdgfsdgfdsgfsdfkgdsf");
      res.render("url_link/PrivacyPolicy", {
        msg: req.flash("msg"),
        message: req.flash("message"),
        data
      });
    } catch (error) {
      console.log(error);
    }
  },

  termsAndCondition: async (req, res) => {
    try {

      let data = await Model.CmsModel.findOne({ type: 3 });
      console.log(data,"gfsdgfsdgfdsgfsdfkgdsf");
      res.render("url_link/t_a_c", {
        msg: req.flash("msg"),
        message: req.flash("message"),
        data
      });
    } catch (error) {
      console.log(error);
    }
  },
};
