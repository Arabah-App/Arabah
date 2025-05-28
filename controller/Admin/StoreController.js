const Model = require("../../Model/Index");
const StoreModel = require("../../Model/StoreModel");
const helper = require("../../utility/helper");

module.exports = {
  addStore: async (req, res) => {
    try {
      let title = "Store";
      res.render("Admin/store/addStore.ejs", {
        title,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  // postStore: async (req, res) => {
  //   try {
  //     if (req.files && req.files.image) {
  //       var image = req.files.image;
  //       if (image) {
  //         req.body.image = helper.imageUpload(image, "images");
  //       }
  //     }
     

  //     const ddd = await StoreModel.create({
  //       image: req.body.image,
  //       name: req.body.name,
  //       nameArabic: req.body.nameArabic,
  //     });
  //     req.flash("msg", "Store Add Successfully");
  //     res.redirect("/StoreList");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },
  postStore: async (req, res) => {
    try {
      if (req.body.image) {
        const base64Image = req.body.image;
  
        const imagePath = helper.imageUploadrop(base64Image, 'images'); 
  
        await StoreModel.create({
          image: imagePath,
          name: req.body.name,
          nameArabic: req.body.nameArabic,
        });
  
        req.flash("msg", "Store added successfully!");
        res.redirect("/StoreList");
      } else {
        res.status(400).json({ message: 'No image provided' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'An error occurred while adding the store' });
    }
  },
  
  StoreList: async (req, res) => {
    try {
      let title = "Store";
      const categoryData = await StoreModel.find();
      res.render("Admin/store/storeList.ejs", {
        title,
        categoryData,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  editStore: async (req, res) => {
    try {
      let title = "Store";
      const activitydetail = await StoreModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/store/editStore", {
        title,
        activitydetail,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  ViewStore: async (req, res) => {
    try {
      let title = "Store";
      const activitydetail = await StoreModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/store/viewstore", {
        title,
        activitydetail,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  updateStore: async (req, res) => {
    try {
 if (req.files && req.files.image) {
        var image = req.files.image;
        if (image) {
            const uploadedImage = helper.imageUpload(image, "images");
            req.body.image = uploadedImage.path; // Store only the path as a string
        }
    }

      const updateData = await StoreModel.updateOne(
        { _id: req.body.id },

        {
          image: req.body.image,
          name: req.body.name,
          nameArabic: req.body.nameArabic,
        }
      );

      req.flash("msg", `Store Updated Successfully`);

      res.redirect("/StoreList");
    } catch (error) {
      console.log(error);
    }
  },

  deleteStore: async (req, res) => {
    try {
      let id = req.body.id;
      await StoreModel.findByIdAndDelete(
        { _id: id },
        { deleted: true },
        { new: true }
      );
      res.redirect("/StoreList");
    } catch (error) {
      console.log(error);
    }
  },

  CategoryStatus: async (req, res) => {
    try {
      await Model.DealModel.updateOne(
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
