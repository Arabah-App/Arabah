const Model = require("../../Model/Index");

const activityModel = require("../../Model/categoryModel");
// const weekGoals = require('../../model/Admin/FaQ')
const bcrypt = require("bcrypt");
const helper = require("../../utility/helper");
const { Validator } = require("node-input-validator");
const StoreModel = require("../../Model/StoreModel");

module.exports = {
  loginPage: async (req, res) => {
    try {
      res.render("Admin/admin/loginPage", {
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const findUser = await Model.UserModel.findOne({ email, role: 0 });
      if (!findUser) {
        console.log("incorrect email");
        req.flash("msg", "Incorrect email");
        return res.redirect("/loginPage");
      }
      const checkPassword = await bcrypt.compare(password, findUser.password);
      if (!checkPassword) {
        console.log("incorrect password");
        req.flash("msg", "Incorrect password");
        return res.redirect("/loginPage");
      }
      req.session.user = findUser;
      req.flash("msg", "Login successfully");
      return res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  },
  dashboard: async (req, res) => {
    try {
      const title = "dashboard";
      const users = await Model.UserModel.count({ role: 1, isDeleted: false });
      const category = await Model.CategoryModel.count();
      const Contact = await Model.ContactModel.count();
      const Light = await Model.LightsModel.count();
      const Faq = await Model.FaqModel.count();
      const Store = await StoreModel.count();
      const Comments = await Model.commentsModel.count();
      const reports = await Model.reportModel.count();
      const currentYear = new Date().getFullYear();

      // Aggregate usersData for the current year
      const usersData = await Model.UserModel.aggregate([
        {
          $match: {
            role: 1,
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.month": 1 },
        },
      ]);

      const monthlyRegistrations = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        count: 0,
      }));

      usersData.forEach(({ _id, count }) => {
        monthlyRegistrations[_id.month - 1].count = count;
      });

      const userCounts = monthlyRegistrations.map((m) => m.count);
      console.log("🚀 ~ dashboard: ~ userCounts:", userCounts);

      // Aggregate counts for the current year
      const counts = await Model.LightsModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const monthlyCounts = Array(12).fill(0);
      counts.forEach((item) => {
        monthlyCounts[item._id - 1] = item.count;
      });

      const countsForChart = monthlyCounts;

      res.render("Admin/admin/dashboard", {
        title,
        users,
        Light,
        category,
        Faq,
        Store,
        Contact,
        Comments,
        reports,
        counts: countsForChart,
        userCounts,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
        formattedDate: new Date().toLocaleDateString("en-GB"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  // dashboard: async (req, res) => {
  //     try {
  //         const title = "dashboard"
  //         const users = await Model.UserModel.count({ role: 1 });
  //         const category = await Model.CategoryModel.count();
  //         const Contact = await Model.ContactModel.count();
  //         const Light = await Model.LightsModel.count();
  //         const Faq = await Model.FaqModel.count();

  //         res.render('Admin/admin/dashboard', { title, users,Light, category,Faq, Contact, session: req.session.user, msg: req.flash('msg') })
  //     } catch (error) {
  //         console.log(error)
  //     }
  // },

  profile: async (req, res) => {
    try {
      let title = "profile";
      res.render("Admin/admin/profile", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  editprofile: async (req, res) => {
    try {
      let title = "editprofile";
      res.render("Admin/admin/editprofile", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  updateAdminProfile: async (req, res) => {
    try {
 if (req.files && req.files.image) {
        var image = req.files.image;
        if (image) {
            const uploadedImage = helper.imageUpload(image, "images");
            req.body.image = uploadedImage.path; // Store only the path as a string
        }
    }
      const updateData = await Model.UserModel.findByIdAndUpdate(
        { _id: req.session.user._id },
        {
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          image: req.body.image,
        }
      );

      const data = await Model.UserModel.findById({
        _id: req.session.user._id,
      });
      req.session.user = data;
      req.flash("msg", "Profile updated successfully");

      // res.json("updated successfully")
      if (updateData) {
        res.redirect("back");
        // res.json("error")
      } else {
        res.redirect("back");
        // res.json("failed")
      }
      res.json("here");
      // res.redirect("/profile")
    } catch (error) {
      console.log(error);
    }
  },

  changePassword: async (req, res) => {
    try {
      let title = "changePassword";
      res.render("Admin/admin/changePassword", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  updatepassword: async function (req, res) {
    try {
      const V = new Validator(req.body, {
        oldPassword: "required",
        newPassword: "required",
        confirm_password: "required|same:newPassword",
      });
      V.check().then(function (matched) {
        console.log(matched);
        console.log(V.errors);
      });
      let data = req.session.user;
      if (data) {
        let comp = await bcrypt.compare(V.inputs.oldPassword, data.password);
        if (comp) {
          const bcryptPassword = await bcrypt.hash(req.body.newPassword, 10);
          let create = await Model.UserModel.updateOne(
            { _id: data._id },
            { password: bcryptPassword }
          );
          req.session.user = create;
          req.flash("msg", "Password updated successfully");
          res.redirect("/loginPage");
          // res.json("updated successfully")
        } else {
          req.flash("msg", "Invalid old password");
          res.redirect("/changePassword");
          // res.json("Old password do not match")
        }
      }
    } catch (error) {
      console.log(error);
    }
  },

  logout: async (req, res) => {
    try {
      req.session.destroy((err) => {});
      res.redirect("/loginPage");
    } catch (error) {
      helper.error(res, error);
    }
  },

  errorPage: async (req, res) => {
    try {
      res.render("Admin/admin/errorPage", {
        msg: req.flash("msg"),
        message: req.flash("message"),
      });
    } catch (error) {
      console.log(error);
    }
  },
};
