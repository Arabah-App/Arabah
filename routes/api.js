const express = require("express");
const {
  uploadFile,
  asyncMiddleware,
  authenticateToken,
                   
  opinalauthenticateToken,

} = require("../utility/helpers");
const UserController = require("../controller/Api/UserController");
const cmsController = require("../controller/Api/cmsController");

const RasiedTicket = require("../controller/Api/RasiedTicket");
const ContactUsController = require("../controller/Api/ContactUsController");
const CategoryController = require("../controller/Api/CategoryController");
const CommentController = require("../controller/Api/CommentController");
const ReportController = require("../controller/Api/ReportController");
const RatingController = require("../controller/Api/RatingController");
const homeController = require("../controller/Api/homeController");
const ShoppingController = require("../controller/Api/ShoppingController");
const NotificationController = require("../controller/Api/NotificationController");
const SearchController = require("../controller/Api/SearchController");
const NotesController = require("../controller/Api/NotesController");
const router = express.Router();

router.post("/fileupload", uploadFile);

//<-------------------auth--------------------------->
router.post("/Signup", asyncMiddleware,UserController.Signup);
router.post("/verifyOtp", asyncMiddleware, UserController.verifyOtp);

router.post("/resent_otp", asyncMiddleware, UserController.resent_otp);
router.get("/privacy-policy", cmsController.privacyPolicyUrl);
router.get("/terms-And-Condition", cmsController.termsAndCondition);

 
//<--------------------------user-------------------------------->

router.post(
  "/CompleteProfile",
  asyncMiddleware,
  authenticateToken,
  UserController.CompleteProfile
);

router.post(
  "/changeLanguage",
  asyncMiddleware,
  authenticateToken,
  UserController.changeLanguage
);
router.get(
  "/Get_profile",
  asyncMiddleware,
  authenticateToken,
  UserController.Get_profile
);
router.post(
  "/DeleteAccount",
  asyncMiddleware,
  authenticateToken,
  UserController.DeleteAccount
);
router.post(
  "/logOut",
  asyncMiddleware,
  authenticateToken,
  UserController.logOut
);

/* ------------------------------------- Ticket ----------------------------------------- */
router.post(
  "/createTicket",
  asyncMiddleware,
  authenticateToken,
  RasiedTicket.createTicket
);
router.get(
  "/TicketList",
  asyncMiddleware,
  authenticateToken,
  RasiedTicket.TicketList
);
//<---------------------------ContactUs-------------------------------------------------->

router.post(
  "/CraeteContact",
  asyncMiddleware,
  authenticateToken,
  ContactUsController.CraeteContact
);
router.post(
  "/ProductLike",
  asyncMiddleware,
  authenticateToken,
  CategoryController.ProductLike
);
// router.post(
//   "/ProductDisLike",
//   asyncMiddleware,
//   authenticateToken,
//   CategoryController.ProductDisLike
// );
router.get(
  "/ProductLike_list",
  asyncMiddleware,
  authenticateToken,
  CategoryController.ProductLike_list
);
router.get(
  "/categorylist",
  asyncMiddleware,
  authenticateToken,
  CategoryController.categorylist
);
router.get(
  "/SubCategoryProduct",
  asyncMiddleware,
  
  CategoryController.SubCategoryProduct
);
router.get(
  "/LatestProduct",
  asyncMiddleware,
  
  CategoryController.LatestProduct
);
router.get(
  "/ProductDetail",
  asyncMiddleware,
  opinalauthenticateToken,

  CategoryController.ProductDetail
);
router.get(
  "/BarCodeDetail",
  asyncMiddleware,
  opinalauthenticateToken,

  CategoryController.BarCodeDetail
);
router.get(
  "/DealListing",
  asyncMiddleware,
  
  CategoryController.DealListing
);
router.get(
  "/similarProducts",
  asyncMiddleware,
  authenticateToken,
  CategoryController.similarProducts
);

router.post(
  "/CreateComment",
  asyncMiddleware,
  authenticateToken,
  CommentController.CreateComment
);
router.get(
  "/CommentList",
  asyncMiddleware,
  authenticateToken,
  CommentController.CommentList
);

router.post(
  "/ReportCreate",
  asyncMiddleware,
  authenticateToken,
  ReportController.ReportCreate
);

router.post(
  "/CreateRating",
  asyncMiddleware,
  authenticateToken,
  RatingController.CreateRating
);
router.get(
  "/RatingList",
  asyncMiddleware,
  authenticateToken,
  RatingController.RatingList
);
router.get("/home", asyncMiddleware, homeController.home);
router.get("/categoryFilter", asyncMiddleware, homeController.categoryFilter);


router.get("/allFilter", asyncMiddleware, authenticateToken, homeController.allFilter);

router.put(
  "/PriceNotification",
  asyncMiddleware,
  authenticateToken,
  homeController.PriceNotification
);

router.put(
  "/Notifyme",
  asyncMiddleware,
  authenticateToken,
  homeController.Notifyme
);
router.get("/FaQApi",  homeController.FaQ_ListApi);

router.get(
  "/ApplyFilletr",
  asyncMiddleware,
  authenticateToken,
  SearchController.ApplyFilletr
);
router.post("/searchfilter", asyncMiddleware,authenticateToken,  SearchController.searchFilter);

router.post(
  "/AddtoShoppinglist",
  asyncMiddleware,
  authenticateToken,
  ShoppingController.AddtoShoppinglist
);
router.get(
  "/ShoppingList",
  asyncMiddleware,
  authenticateToken,
  ShoppingController.ShoppingList
);
router.post(
  "/ShoppingProduct_delete",
  asyncMiddleware,
  authenticateToken,
  ShoppingController.ShoppingProduct_delete
);
router.post(
  "/ShoppinglistClear",
  asyncMiddleware,
  authenticateToken,
  ShoppingController.ShoppinglistClear
);
//<--------------------------Cms----------------------------------->
router.get("/CMSGet", cmsController.CMSGet);

//<-------------------------Faq------------------------------------>
router.get("/FaqGet", asyncMiddleware, authenticateToken, cmsController.FaqGet);
router.get(
  "/Getnotification",
  authenticateToken,
  NotificationController.Getnotification
);
router.post(
  "/deeletNotifiction",
  authenticateToken,
  NotificationController.deeletNotifiction
);


router.post(
  "/CreateSerach",
  authenticateToken,
  SearchController.CreateSerach
);
router.get(
  "/SearchList",
  authenticateToken,
  SearchController.SearchList
);
router.post(
  "/SerachDelete",
  authenticateToken,
  SearchController.SerachDelete
);
/* ---------notes----------- */
router.post(
  "/NotesCreate",
  authenticateToken,
  NotesController.NotesCreate
);
router.get(
  "/getNotes",
  authenticateToken,
  NotesController.getNotes
);
router.get(
  "/Notes",
  authenticateToken,
  NotesController.Notes
);
router.get(
  "/getNotesdetail",
  authenticateToken,
  NotesController.getNotesdetail
);
router.post(
  "/deleteNotes",
  authenticateToken,
  NotesController.deleteNotes
);

module.exports = router;
