const mongoose = require("mongoose");
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log("connect");
}).catch((err) => {
    console.log("Mongo DB error :-" ,err);
})