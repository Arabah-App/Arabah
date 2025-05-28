const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const translate = require("translate-google");
const langdetect = require("langdetect");
module.exports = {
  addCategory: async (req, res) => {
    try {
      let title = "category";
      res.render("Admin/category/addCatergory", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  postCategory: async (req, res) => {
    try {
      // Handle image upload
      // let imagePath = "";

      // if (req.body.image) {
      //   const base64Image = req.body.image;
      //   imagePath = helper.imageUpload(base64Image, "images"); 
      // }
      
      if (req.files && req.files.image) {
        var image = req.files.image;
        if (image) {
            const uploadedImage = helper.imageUpload(image, "images");
            req.body.image = uploadedImage.path; 
        }
    }
      const category = await Model.CategoryModel.create({
        categoryName: req.body.categoryName,
        categoryNameArabic: req.body.categoryNameArabic,
        image: req.body.image,
      });
      
      console.log(category, "categorycategory");
      req.flash("msg", `"${category.categoryName} Added Successfully"`);
      return res.redirect("/CategoryList");
    } catch (error) {
      console.error("Error adding category:", error.message);
      req.flash(
        "error",
        "An error occurred while adding the category. Please try again."
      );
    }
  },

  CategoryList: async (req, res) => {
    try {
      let title = "category";
      const categoryData = await Model.CategoryModel.find({ deleted: false });
      res.render("Admin/category/catehoryList", {
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

  Categoryview: async (req, res) => {
    try {
      let title = "category";
      const activityView = await Model.CategoryModel.findById({
        _id: req.params.id,
      }).populate("userId babyId");
      res.render("Admin/category/viewActivity", {
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

  editCategory: async (req, res) => {
    try {
      let title = "category";
      const activitydetail = await Model.CategoryModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/category/editCatergory", {
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
  ViewCategory: async (req, res) => {
    try {
      let title = "category";
      const activitydetail = await Model.CategoryModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/category/viewCatergory.ejs", {
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

  updateCategory: async (req, res) => {
    try {
      if (req.files && req.files.image) {
        var image = req.files.image;
        if (image) {
          const uploadedImage = helper.imageUpload(image, "images");
          req.body.image = uploadedImage.path; // Store only the path as a string
        }
      }

      const updateData = await Model.CategoryModel.updateOne(
        { _id: req.body.id },

        {
          categoryName: req.body.categoryName,
          categoryNameArabic: req.body.categoryNameArabic,
          image: req.body.image,
        }
      );
      req.flash("msg", `${updateData.categoryName} Updated Successfully`);
      res.redirect("/CategoryList");
    } catch (error) {
      console.log(error);
    }
  },

  deleteCategory: async (req, res) => {
    try {
      let id = req.body.id;
      await Model.CategoryModel.findByIdAndDelete(
        { _id: id },
        { deleted: true },
        { new: true }
      );
      res.redirect("/CategoryList");
    } catch (error) {
      console.log(error);
    }
  },

  CategoryStatus: async (req, res) => {
    try {
      await Model.CategoryModel.updateOne(
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
