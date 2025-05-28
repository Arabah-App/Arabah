const Model = require("../../Model/Index");
const helper = require("../../utility/helper");
const helpers = require("../../utility/helpers");
const bcrypt = require("bcrypt");

module.exports = {
  createUser: helpers.AsyncHanddle(async (req, res) => {
    const userExist = await Model.UserModel.findOne({ email: req.body.email });
    if (userExist) {
      return helper.failed(res, "Email Already Exist");
    }
    if (req.files && req.files.image) {
      var image = req.files.image;
      if (image) {
        req.body.image = helper.imageUpload(image, "images");
      }
    }
    let hash = await bcrypt.hash(req.body.password, 10);
    let createuser = await Model.UserModel.create({
      role: req.body.role,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.body.image,
      password: hash,
    });
    return helper.success(res, "created successfully", createuser);
  }),

  addUser: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    res.render("Admin/user/addUser", {
      title,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  editUser: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    const updatedata = await Model.UserModel.findOne({ _id: req.params.id });

    res.render("Admin/user/editUser", {
      title,

      updatedata,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  updateUser: helpers.AsyncHanddle(async (req, res) => {
    if (req.files && req.files.image) {
      var image = req.files.image;
      if (image) {
        req.body.image = helper.imageUpload(image, "images");
      }
    }
    await Model.UserModel.updateOne(
      { _id: req.body.id },
      {
        role: req.body.role,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        image: req.body.image,
      }
    );
    res.redirect("/userList");
  }),

  userList: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    const userData = await Model.UserModel.find({
      role: 1,

    }).sort({ createdAt: 1 });
    const activeuser = await Model.UserModel.count({
      role: 1,
      isDeleted: false,
      status: 1,
    });
    const Inactiveuser = await Model.UserModel.count({
      role: 1,
      isDeleted: false,
      status: 0,
    });
    res.render("Admin/user/userList", {
      title,
      userData,
      activeuser,
      Inactiveuser,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  viewUser: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    const userdetails = await Model.UserModel.findById({ _id: req.params.id });
    res.render("Admin/user/viewUser", {
      title,
      userdetails,
      session: req.session.user,
      msg: req.flash("msg"),
      message: req.flash("message"),
});
  }),
  viewUserinreport: helpers.AsyncHanddle(async (req, res) => {
    let title = "RaiseList";
    const userdetails = await Model.UserModel.findById({ _id: req.params.userId });
    console.log("🚀 ~ viewUserinreport:helpers.AsyncHanddle ~ userdetails:", userdetails)

    res.render("Admin/user/viewUserinreprt.ejs", {
      title,
      userdetails,
      session: req.session.user,
      msg: req.flash("msg"),
      message: req.flash("message"),
});
  }),
  viewcomment: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    const userdetails = await Model.UserModel.findById({ _id: req.params.id });
    let comment = await Model.commentsModel
      .find({
        userId: req.params.id,
      })
      .populate([
        { path: "userId", model: "User" },
        { path: "ProductID", model: "light" },
      ]);

    res.render("Admin/user/usercomment", {
      title,
      comment,

      userdetails,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  viewReport: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    const userdetails = await Model.UserModel.findById({ _id: req.params.id });
    let Report = await Model.reportModel
      .find({
        userId: req.params.id,
      })
      .populate([
        { path: "userId", model: "User" },
        { path: "ProductID", model: "light" },
      ]);

    res.render("Admin/user/reportuser", {
      title,
      Report,

      userdetails,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),
  viewRating: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    let rating = await Model.ratingModel
      .find({
        userId: req.params.id,
      })
      .populate([
        { path: "userId", model: "User" },
        { path: "ProductID", model: "light" },
      ]);

    res.render("Admin/user/ratingreview", {
      title,
      rating,

      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  customerList: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    const userId = req.params.id;
    const customerdetails = await Model.CustomerModel.find({
      userId: userId,
    }).populate("userId");
    res.render("Admin/user/customet", {
      title,
      customerdetails,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  teamMemberlist: helpers.AsyncHanddle(async (req, res) => {
    let title = "userList";
    const userId = req.params.id;
    const teamMemberdetails = await Model.TeamMemberModel.find({
      userId: userId,
    }).populate("userId");
    res.render("Admin/user/teammember", {
      title,
      teamMemberdetails,
      session: req.session.user,
      message: req.flash("message"),
      msg: req.flash("msg"),
    });
  }),

  userStatus: helpers.AsyncHanddle(async (req, res) => {
    await Model.UserModel.updateOne(
      { _id: req.body.id },
      { status: req.body.value }
    );
    req.flash("msg", "Status updated successfully");
    if (req.body.value == 0) res.send(false);
    if (req.body.value == 1) res.send(true);
  }),

  deleteUser: helpers.AsyncHanddle(async (req, res) => {
    let userId = req.body.id;
    await Model.UserModel.findByIdAndUpdate(
      { _id: userId },
      { isDeleted: true },
      { new: true }
    );
    res.redirect("/userList");
  }),
};
