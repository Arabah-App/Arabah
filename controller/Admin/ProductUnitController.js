

const ProductUnintModel = require("../../Model/ProductUnintModel");
const helper = require("../../utility/helper");
const mongoose = require("mongoose");

module.exports = {
  addProdiuctUnit: async (req, res) => {
    try {
      let title = "ProdiuctUnit";
      res.render("Admin/ProdiuctUnit/AddProdiuctUnit", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  postProdiuctUnit: async (req, res) => {
    try {

      const ddd = await ProductUnintModel.create({
        ProdiuctUnit: req.body.ProdiuctUnit,
        ProdiuctUnitArabic: req.body.ProdiuctUnitArabic,
      });
      req.flash("msg", "ProdiuctUnit Add Successfully");
      res.redirect("/ProdiuctUnitList");
    } catch (error) {
      console.log(error);
    }
  },
  ProdiuctUnitList: async (req, res) => {
    try {
      let title = "ProdiuctUnit";
      const categoryData = await ProductUnintModel.find({ deleted: false });
      res.render("Admin/ProdiuctUnit/ProdiuctUnitList", {
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
  ProdiuctUnitview: async (req, res) => {
    try {
      let title = "ProdiuctUnit";
      const activitydetail = await ProductUnintModel
        .findById({
          _id: req.params.id,
        })
       
      res.render("Admin/ProdiuctUnit/ViewProdiuctUnit", {
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

  editProdiuctUnit: async (req, res) => {
    try {
      let title = "ProdiuctUnit";
      const activitydetail = await ProductUnintModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/ProdiuctUnit/EditProdiuctUnit", {
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
  updateProdiuctUnit: async (req, res) => {
    try {


      const updateData = await ProductUnintModel.findByIdAndUpdate(
        req.body.id,
        {      ProdiuctUnit: req.body.ProdiuctUnit,
            ProdiuctUnitArabic: req.body.ProdiuctUnitArabic, },
        { new: true }
      );

    

      req.flash("msg", "ProdiuctUnit updated successfully");
      res.redirect("/ProdiuctUnitList");
    } catch (error) {
      console.error("Error updating ProdiuctUnitList:", error);
      req.flash("msg", "Error updating Brand. Please try again.");
      res.redirect("/ProdiuctUnitList");
    }
  },
  
  deleteProdiuctUnitList: async (req, res) => {
    try {
      let id = req.body.id;
      await ProductUnintModel.findByIdAndDelete(
        { _id: id },
        { deleted: true },
        { new: true }
      );
      res.redirect("/ProdiuctUnitList");
    } catch (error) {
      console.log(error);
    }
  },

}