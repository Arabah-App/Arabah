const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const mongoose = require("mongoose");

module.exports = {
  addbanner: async (req, res) => {
    try {
      let title = "banner";
      res.render("Admin/banner/Addbanner", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  postbanner: async (req, res) => {
    try {
      if (req.body.image) {
        const base64Image = req.body.image;
  
        const imagePath = helper.imageUploadrop(base64Image, 'images'); 
      const ddd = await Model.bannerModel.create({
        image: imagePath,
      });
      req.flash("msg", "Banner Add Successfully");
      res.redirect("/bannerList");
    }} catch (error) {
      console.log(error);
    }
  },

  bannerList: async (req, res) => {
    try {
      let title = "banner";
      const categoryData = await Model.bannerModel.find({ deleted: false });
      res.render("Admin/banner/bannerList", {
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

  bannerview: async (req, res) => {
    try {
      let title = "banner";
      const activityView = await Model.bannerModel
        .findById({
          _id: req.params.id,
        })
        .populate("userId babyId");
      res.render("Admin/banner/editbanner", {
        title,
        activityView,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),

      });
    } catch (error) {
      console.log(error);
    }
  },

  editbanner: async (req, res) => {
    try {
      let title = "banner";
      const activitydetail = await Model.bannerModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/banner/editbanner", {
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
  updatebanner: async (req, res) => {
    try {
    if (req.files && req.files.image) {
          var image = req.files.image;
          if (image) {
              const uploadedImage = helper.imageUpload(image, "images");
              req.body.image = uploadedImage.path; // Store only the path as a string
              const updateData = await Model.bannerModel.findByIdAndUpdate(
                req.body.id,
                { image: req.body.image },
                { new: true }
              );
          }
      }
      console.log(req.body.image,"===============>",req.files );
      

      

    

      req.flash("msg", "Banner updated successfully");
      res.redirect("/bannerList");
    } catch (error) {
      console.error("Error updating banner:", error);
      req.flash("msg", "Error updating banner. Please try again.");
      res.redirect("/bannerList");
    }
  },
  
  deletebanner: async (req, res) => {
    try {
      let id = req.body.id;
      await Model.bannerModel.findByIdAndDelete(
        { _id: id },
        { deleted: true },
        { new: true }
      );
      res.redirect("/bannerList");
    } catch (error) {
      console.log(error);
    }
  },

  CategoryStatus: async (req, res) => {
    try {
      await Model.bannerModel.updateOne(
        { _id: req.body.id },
        { status: req.body.value }
      );
      req.flash("msg", "Status update successfully");
      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
    }
  },
};
