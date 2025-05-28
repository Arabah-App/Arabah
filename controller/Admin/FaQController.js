const helper = require("../../utility/helper");
const Model = require("../../Model/Index");

module.exports = {
  addFaQ: async (req, res) => {
    try {
      let title = "Faq";
      res.render("Admin/FaQ/addFaQ", {
        title,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  saveFaQ: async (req, res) => {
    try {


      // Save the translated content into the database
      await Model.FaqModel.create({
        question: req.body.question,
        questionArabic: req.body.questionArabic,
        answer: req.body.answer,
        answerArabic: req.body.answerArabic,
      });

      // Redirect to FAQ list after saving
      res.redirect("/FaQList");
    } catch (error) {
      console.error("Error saving FAQ: ", error);
      res.status(500).send("An error occurred while saving the FAQ.");
    }
  },

  FaQ_List: async (req, res) => {
    try {
      let title = "Faq";
      const GoalData = await Model.FaqModel.find();
      res.render("Admin/FaQ/FaQList", {
        title,
        GoalData,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  FaQ_view: async (req, res) => {
    try {
      let title = "Faq";
      const goalView = await Model.FaqModel.findById({ _id: req.params.id });
      res.render("Admin/FaQ/viewFaQ", {
        title,
        goalView,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  editFaQ: async (req, res) => {
    try {
      let title = "Faq";
      const Goaldetail = await Model.FaqModel.findById({ _id: req.params.id });
      res.render("Admin/FaQ/editFaQ", {
        title,
        Goaldetail,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  updateFaQ: async (req, res) => {
    try {

      // Update the FAQ in the database
      await Model.FaqModel.updateOne(
        { _id: req.body.id },
        {
          question: req.body.question,
          questionArabic: req.body.questionArabic,
          answer: req.body.answer,
          answerArabic: req.body.answerArabic,
        }
      );

      req.flash("msg", "FaQ updated successfully");
      res.redirect("/FaQList"); // Redirect after update
    } catch (error) {
      console.error("Error updating FAQ: ", error);
      req.flash("msg", "An error occurred while updating the FAQ.");
      res.redirect("/FaQList"); // Redirect to the FAQ list page in case of error
    }
  },

  delete_FaQ: async (req, res) => {
    try {
      let growthID = req.body.id;
      await Model.FaqModel.deleteOne({ _id: growthID });
      res.redirect("/FaQList");
    } catch (error) {
      console.log(error);
    }
  },

  FaQStatus: async (req, res) => {
    try {
      await Model.FaqModel.updateOne(
        { _id: req.body.id },
        { status: req.body.value }
      );
      req.flash("msg", "Status updates successfully");
      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
    }
  },

};
