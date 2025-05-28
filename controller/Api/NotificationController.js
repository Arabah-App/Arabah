const NotificationModel = require("../../Model/NotificationModel");
const helper = require("../../utility/helper");
const helpers = require("../../utility/helpers");
const mongoose = require("mongoose");

module.exports = {
  Getnotification: async (req, res) => {
    console.log(req.user._id);
    try {
      const GetNotify = await NotificationModel.find({
        ReciverId: req.user._id,
      });


      if (!GetNotify || GetNotify.length === 0) {
        return helpers.arraysuccess(res, "No Notifications Found");
      }
      return helpers.success(res, "Get All Notifications", GetNotify);
    } catch (error) {
      console.log(error, "Something Went Wrong");
      return helpers.failed(res, "Something Went Wrong");
    }
  },

  
  deeletNotifiction: async (req, res) => {
    try {
     
      const deletedNotification = await NotificationModel.find({
        ReciverId: new mongoose.Types.ObjectId(req.user._id),
      });
  
  
      if (deletedNotification.length === 0) {
        return helpers.failed(res, "Notification not found");
      }
  
   
      const idsToDelete = deletedNotification.map(notification => notification._id);
  

      const alldelete = await NotificationModel.deleteMany({
        _id: { $in: idsToDelete },
      });
  
      if (alldelete.deletedCount > 0) {
        return helpers.success(res, "Notifications deleted successfully", alldelete);
      }
  
      return helpers.success(res, "Notifications deleted, but no content available");
  
    } catch (error) {
      console.error("Something went wrong:", error);
      return helpers.failed(res, "An error occurred while deleting the notifications");
    }
  }
  
};
