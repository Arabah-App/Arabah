const BrandModel = require("../../Model/BrandModel");

const helper = require("../../utility/helper");
const mongoose = require("mongoose");

module.exports = {
  addbrand: async (req, res) => {
    try {
      let title = "Brand";
      res.render("Admin/Brand/AddBrand", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  postbrand: async (req, res) => {
    try {

      const ddd = await BrandModel.create({
        Brandname: req.body.Brandname,
        BrandnameArabic: req.body.BrandnameArabic,
      });
      req.flash("msg", "Brand Add Successfully");
      res.redirect("/BrandList");
    } catch (error) {
      console.log(error);
    }
  },
  BrandList: async (req, res) => {
    try {
      let title = "Brand";
      const categoryData = await BrandModel.find({ deleted: false });
      res.render("Admin/Brand/BrandList", {
        title,
        categoryData,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },
  Brandview: async (req, res) => {
    try {
      let title = "Brand";
      const activitydetail = await BrandModel
        .findById({
          _id: req.params.id,
        })
       
      res.render("Admin/Brand/ViewBarnd", {
        title,
        activitydetail,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  editBrand: async (req, res) => {
    try {
      let title = "Brand";
      const activitydetail = await BrandModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/Brand/EditBrand", {
        title,
        activitydetail,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },
  updateBrand: async (req, res) => {
    try {


      const updateData = await BrandModel.findByIdAndUpdate(
        req.body.id,
        {      Brandname: req.body.Brandname,
            BrandnameArabic: req.body.BrandnameArabic, },
        { new: true }
      );

    

      req.flash("msg", "Brand updated successfully");
      res.redirect("/BrandList");
    } catch (error) {
      console.error("Error updating Brand:", error);
      req.flash("msg", "Error updating Brand. Please try again.");
      res.redirect("/BrandList");
    }
  },
  
  deleteBrand: async (req, res) => {
    try {
      let id = req.body.id;
      await BrandModel.findByIdAndDelete(
        { _id: id },
        { deleted: true },
        { new: true }
      );
      res.redirect("/BrandList");
    } catch (error) {
      console.log(error);
    }
  },

}