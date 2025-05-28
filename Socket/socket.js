

const mongoose = require('mongoose');
const CommentsModel = require('../Model/CommentsModel');
const SocketModel = require('../Model/SocketModel');

module.exports = function (io) {
  io.on("connection", function (socket) {
    // console.log(socket, ">>>>>>>>>>my io is woring fine >>>>>>>>>>>>");
    // return;

    socket.on("connect_user", async (connect_listener) => {
        try {
          let socket_id = socket.id;
          const userId = connect_listener?.userId;
          let check_user = await SocketModel.findOne({ userId: userId });
          if (check_user) {
            create_socket_user = await SocketModel.findOneAndUpdate(
              { userId: userId },
              {
                status: 1,
                socketId: socket_id,
              }
            );
            console.log(check_user, "======>");
          } else {
            create_socket_user = await SocketModel.create({
              userId: connect_listener.userId,
              status: 1,
              socketId: socket_id,
            });
          }
  
          success_message = {
            success_message: "Connected successfully",
          };
  
          socket.emit("connect_user", success_message);
        } catch (error) {
          throw error;
        }
      });

    socket.on("Product_Comment", async (get_data) => {
      const { UserId, Productid,comment } = get_data;
      const Comment = await CommentsModel.create({
        userId: UserId, 
        ProductID: Productid,
        comment: comment,
      })

      const array = await CommentsModel.findOne({_id:Comment._id}).populate({path:"userId" ,select:"name image nameArabic "})
      success_message = {
        
        success_message: "Comment  successfully",
      };
      socket.emit("Product_Comment", [array]);
    });
    
    
  });
};
