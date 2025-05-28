var express = require("express");
const AdminController = require("../controller/Admin/AdminController");
const userController = require("../controller/Admin/userController");
const cmsController = require("../controller/Admin/cmsController");
const contactUsController = require("../controller/Admin/contactUsController");
const { session } = require("../utility/helper");
const activityController = require("../controller/Admin/CategoryController");
const FaQController = require("../controller/Admin/FaQController");
const lightController = require("../controller/Admin/lightController");
const { bannerList } = require("../controller/Admin/BannerController");
const BannerController = require("../controller/Admin/BannerController");
const CommentsController = require("../controller/Admin/CommentsController");
const ReportController = require("../controller/Admin/ReportController");
const RatingController = require("../controller/Admin/RatingController");
const DealController = require("../controller/Admin/DealController");
const RaiseTicketController = require("../controller/Admin/RaiseTicketController");
const StoreController = require("../controller/Admin/StoreController");
const BrandController = require("../controller/Admin/BrandController");
const ProductUnitController = require("../controller/Admin/ProductUnitController");
const FavProductController = require("../controller/Admin/FavProductController");
let router = express.Router();

//<-------------------auth----------------------------------->
router.get("/loginPage", AdminController.loginPage);
router.post("/login", AdminController.login);
router.get("/dashboard", session, AdminController.dashboard);
router.get("/profile", session, AdminController.profile);
router.get("/editprofile", session, AdminController.editprofile);
router.post("/updateAdminProfile", AdminController.updateAdminProfile);
router.get("/changePassword", session, AdminController.changePassword);
router.post("/updatepassword", AdminController.updatepassword);
router.get("/logout", AdminController.logout);
router.get("/errorPage", AdminController.errorPage);

//<-------------------- USER ----------------------------------------->
router.get("/userList", session, userController.userList);
router.get("/viewUser/:id", userController.viewUser);
router.get("/viewUserinreport/:userId", userController.viewUserinreport);

router.get("/customerList/:id", userController.customerList);
router.get("/teamMemberlist/:id", userController.teamMemberlist);

router.get("/addUser", session, userController.addUser);
router.get("/editUser/:id", session, userController.editUser);
router.post("/createUser", userController.createUser);
router.post("/updateUser", userController.updateUser);
router.delete("/deleteUser/:id", userController.deleteUser);
router.post("/userStatus", userController.userStatus);
router.get("/userviewcomment/:id", session, userController.viewcomment);
router.get("/userviewReport/:id", session, userController.viewReport);
router.get("/userviewRating/:id", session, userController.viewRating);

//<------------------------ CMS ------------------------->
router.post("/addCms", cmsController.addCms);
router.get("/aboutUs", session, cmsController.aboutUs);
router.get("/Arabicaboutus", session, cmsController.Arabicaboutus);

router.get("/privacyPolicy", session, cmsController.privacyPolicy);
router.get("/Arabicprivacy", session, cmsController.Arabicprivacy);

router.get("/termsConditions", session, cmsController.termsConditions);
router.get("/arabictermsConditions", session, cmsController.arabictermsConditions);

router.post("/updatecms", cmsController.updatecms);
router.post("/updatearabic", cmsController.updatearabic);


//<------------------ Contact US SUPPORT ----------------->
router.post("/createContactUs", contactUsController.createContactUs);
router.get("/contactUsList", session, contactUsController.contactUsList);
router.get("/viewContactUs/:id", session, contactUsController.viewContactUs);
router.delete("/delete_contact/:id", contactUsController.delete_contact);
router.post("/contactusStatus", contactUsController.contactusStatus);

//<-------------------- Category --------------------------->
router.post("/postCategory", session, activityController.postCategory);
router.get("/CategoryList", session, activityController.CategoryList);
router.get("/Categoryview/:id", session, activityController.Categoryview);
router.get("/editCategory/:id", session, activityController.editCategory);
router.get("/ViewCategory/:id", session, activityController.ViewCategory);

router.post("/updateCategory", activityController.updateCategory);
router.delete("/deleteCategory/:id", activityController.deleteCategory);
router.get("/addCategory", session, activityController.addCategory);
router.post("/CategoryStatus", session, activityController.CategoryStatus);

//<-------------------- banner --------------------------->
router.post("/postbanner", session, BannerController.postbanner);
router.get("/bannerList", session, BannerController.bannerList);
router.get("/bannerview/:id", session, BannerController.bannerview);
router.get("/editbanner/:id", session, BannerController.editbanner);
router.post("/updatebanner", BannerController.updatebanner);
router.delete("/deletebanner/:id", BannerController.deletebanner);
router.get("/addbanner", session, BannerController.addbanner);
router.post("/CategoryStatus", session, BannerController.CategoryStatus);

//<-------------------------lights------------------------>
router.get("/check-barcode", session, lightController.checkBarCode);
router.get("/edit/check-barcode", session, lightController.checkEditBarCode);

router.get("/DownloadExcelProduct", session, lightController.DownloadExcelProduct);

router.get("/SubCategoryList", session, lightController.findAlllights);
router.post("/lightCreate", session, lightController.lightCreate);
router.post("/bulkProductCreate", session, lightController.bulkProductCreate);

router.get("/AddSubCategory", session, lightController.addLights);
router.get("/addBulk_product", session, lightController.addBulk);

router.delete("/deleteLights/:id", lightController.deleteLights);
router.get("/EditSubCategory/:id", session, lightController.editligths);
router.post("/updatelights", session, lightController.updatelights);
router.get("/ProductComment/:id", session, lightController.ProductComment);
router.get("/ProductRating/:id", session, lightController.ProductRating);
router.get("/ProductReport/:id", session, lightController.ProductReport);
router.get("/viewProduct/:id", session, lightController.viewProduct);
router.get("/findupdatedPrice/:id", session, lightController.findupdatedPrice);
router.get(
  "/editproductcommment/:id",
  session,
  lightController.editproductcommment
);
router.get(
  "/viewproductreport/:id",
  session,
  lightController.viewproductreport
);



//<-------------------------Comments------------------------>

router.get("/CommentList", session, CommentsController.CommentList);
router.get("/editcommment/:id", session, CommentsController.editcommment);
//<-------------------------Raise------------------------>

router.get("/RaiseList", session, RaiseTicketController.RaiseList);
router.get("/viewRaise/:id", session, RaiseTicketController.viewRaise);

//<-------------------------report------------------------>

router.get("/reportList", session, ReportController.reportList);
router.get("/viewreport/:id", session, ReportController.viewreport);
router.post("/ReportStatus", ReportController.ReportStatus);

//<-------------------------Rating------------------------>

router.get("/ratingList", session, RatingController.ratingList);
router.get("/editrating/:id", session, RatingController.editrating);
//<-------------------------deal------------------------>

router.post("/postDeal", session, DealController.postDeal);
router.get("/DealList", session, DealController.DealList);
router.get("/editDeal/:id", session, DealController.editDeal);
router.post("/updateDeal", DealController.updateDeal);
router.delete("/deleteDeal/:id", DealController.deleteDeal);
router.get("/addDeal", session, DealController.addDeal);
router.post("/CategoryStatus", session, DealController.CategoryStatus);

//<-------------------------Store------------------------>

router.post("/postStore", session, StoreController.postStore);
router.get("/StoreList", session, StoreController.StoreList);
router.get("/editStore/:id", session, StoreController.editStore);
router.get("/ViewStore/:id", session, StoreController.ViewStore);
router.post("/updateStore", StoreController.updateStore);
router.delete("/deleteStore/:id", StoreController.deleteStore);
router.get("/addStore", session, StoreController.addStore);

//<---------------------  FaQ  ---------------------------->
router.post("/saveGoal", session, FaQController.saveFaQ);
router.get("/FaQList", session, FaQController.FaQ_List);
router.get("/goalview/:id", session, FaQController.FaQ_view);
router.get("/editGoal/:id", session, FaQController.editFaQ);
router.post("/updateFaQ", session, FaQController.updateFaQ);
router.delete("/delete_goale/:id", session, FaQController.delete_FaQ);
router.get("/addGoal", session, FaQController.addFaQ);
router.post("/goaleStatus", session, FaQController.FaQStatus);

//<-------------------- Brand --------------------------->
router.post("/postbrand", session, BrandController.postbrand);
router.get("/BrandList", session, BrandController.BrandList);
router.get("/Brandview/:id", session, BrandController.Brandview);
router.get("/editBrand/:id", session, BrandController.editBrand);
router.post("/updateBrand", BrandController.updateBrand);
router.delete("/deleteBrand/:id", BrandController.deleteBrand);
router.get("/addbrand", session, BrandController.addbrand);
//<-------------------- Productunit --------------------------->
router.post("/postProdiuctUnit", session, ProductUnitController.postProdiuctUnit);
router.get("/ProdiuctUnitList", session, ProductUnitController.ProdiuctUnitList);
router.get("/ProdiuctUnitview/:id", session, ProductUnitController.ProdiuctUnitview);
router.get("/editProdiuctUnit/:id", session, ProductUnitController.editProdiuctUnit);
router.post("/updateProdiuctUnit", ProductUnitController.updateProdiuctUnit);
router.delete("/deleteProdiuctUnitList/:id", ProductUnitController.deleteProdiuctUnitList);
router.get("/addProdiuctUnit", session, ProductUnitController.addProdiuctUnit);
//<-------------------------Like------------------------>

router.get("/LikeList", session, FavProductController.LikeList);
router.get("/viewLike/:id", session, FavProductController.viewLike);

router.get("/notifications", session, FavProductController.notifications);
router.post("/notifications", session, FavProductController.notifications);
module.exports = router;
