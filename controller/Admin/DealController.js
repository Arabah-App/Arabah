const Model = require("../../Model/Index");
const StoreModel = require("../../Model/StoreModel");
const helper = require("../../utility/helper");

module.exports = {
  addDeal: async (req, res) => {
    try {
      let title = "Deal";
      const stores = await StoreModel.find();
      res.render("Admin/Deal/AddDeal.ejs", {
        title,
        stores,
        session: req.session.user,
        message: req.flash("message"),
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },postDeal: async (req, res) => {
    try {
      if (req.files && req.files.image) {
        const file = req.files.image;
        const ext = file.name.split('.').pop().toLowerCase();
  
        // You can decide folder based on file type
        let folder = "others";
        if (["jpg", "jpeg", "png"].includes(ext)) {
          folder = "images";
        } else if (ext === "pdf") {
          folder = "images";
        }
  
        const uploadedFile = await helper.imageUpload(file, folder);
        req.body.image = uploadedFile.path; // Use same key
      }
  
      const { title_1, title_2 } = await helper.translateText(req.body.Decription);
  
      const ddd = await Model.DealModel.create({
        StoreId: req.body.StoreId,
        image: req.body.image, // Could be image or PDF path
        Decription: req.body.Decription,
        DecriptionArabic: req.body.DecriptionArabic,
      });
  
      console.log(ddd, "Deal Created");
      req.flash("msg", "Deal Added Successfully");
      res.redirect("/DealList");
    } catch (error) {
      console.log(error);
      res.status(500).send("Something went wrong");
    }
  },
  

  // postDeal: async (req, res) => {
  //   try {

  //     if (req.files && req.files.image) {
  //       var image = req.files.image;
  //       if (image) {
  //           const uploadedImage = helper.imageUpload(image, "images");
  //           req.body.image = uploadedImage.path; 
  //       }
  //   }
  //     const { title_1, title_2 } = await helper.translateText(
  //       req.body.Decription
  //     );

  //     const ddd = await Model.DealModel.create({
  //       StoreId: req.body.StoreId,
  //       image: req.body.image,
  //       Decription: title_1,
  //       DecriptionArabic: title_2,
  //     });
      
  //     console.log(ddd, "ddddddddd");
  //     req.flash("msg", "Deal Add Successfully");
  //     res.redirect("/DealList");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // },

  DealList: async (req, res) => {
    try {
      let title = "Deal";
      const categoryData = await Model.DealModel.find({
        deleted: false,
      }).populate("StoreId");
      console.log("🚀 ~ DealList: ~ categoryData:", categoryData);
      res.render("Admin/Deal/DealList", {
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

  editDeal: async (req, res) => {
    try {
      let title = "Deal";
      const activitydetail = await Model.DealModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/Deal/editDeal", {
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



  
//   updateDeal: async (req, res) => {
//     try {
//  if (req.files && req.files.image) {
//         var image = req.files.image;
//         if (image) {
//             const uploadedImage = helper.imageUpload(image, "images");
//             req.body.image = uploadedImage.path; // Store only the path as a string
//         }
//     }
//       const { title_1, title_2 } = await helper.translateText(
//         req.body.Decription
//       );
//       const updateData = await Model.DealModel.updateOne(
//         { _id: req.body.id },

//         {
//           image: req.body.image,
//           Decription: title_1,
//           DecriptionArabic: title_2,
//         }
//       );
//       req.flash("msg", "Deal Updated Successfully");
//       res.redirect("/DealList");
//     } catch (error) {
//       console.log(error);
//     }
//   },
updateDeal: async (req, res) => {
  try {
    // Get existing deal
    const existingDeal = await Model.DealModel.findById(req.body.id);

    // Handle new file (image or PDF)
    if (req.files && req.files.image) {
      const file = req.files.image;
      const ext = file.name.split('.').pop().toLowerCase();

      let folder = "others";
      if (["jpg", "jpeg", "png"].includes(ext)) {
        folder = "images";
      } else if (ext === "pdf") {
        folder = "images";
      }

      // Await the upload
      const uploadedFile = await helper.imageUpload(file, folder);
      req.body.image = uploadedFile.path;
    } else {
      // No new file uploaded, retain the old one
      req.body.image = existingDeal.image;
    }



    // Update deal
    await Model.DealModel.updateOne(
      { _id: req.body.id },
      {
        image: req.body.image,
        Decription: req.body.Decription,
        DecriptionArabic: req.body.DecriptionArabic,
      }
    );

    req.flash("msg", "Deal Updated Successfully");
    res.redirect("/DealList");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating deal");
  }
},

  deleteDeal: async (req, res) => {
    try {
      let id = req.body.id;
      await Model.DealModel.findByIdAndDelete(
        { _id: id },
        { deleted: true },
        { new: true }
      );
      res.redirect("/DealList");
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
