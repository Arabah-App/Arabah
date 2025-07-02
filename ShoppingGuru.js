const createError = require("http-errors");
const express = require("express");
const sanitizeInputs = require('./utility/sanitizeInputs');
const app = express();
const helmet = require("helmet");
const compression = require("compression");
const http = require("http").Server(app);
const io = require("socket.io")(http);
const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileupload = require("express-fileupload");
const flash = require("express-flash");
const mongoose = require("./config/Connection");
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const helpers = require("./utility/helpers");
require("dotenv").config();
const catchServerError = helpers.catchServerError;
const PORT = process.env.PORT;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.json());
app.use(sanitizeInputs);
app.use(fileupload());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1y", 
  })
);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);
app.use(
  compression({
    threshold: 1024, 
    brotli: { enabled: true, zlib: {} },
  })
);
app.use(flash());
// app.use(sanitizeInputs);



app.use("/", indexRouter);
app.use("/api", apiRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(catchServerError);

require("./Socket/socket")(io);
http.listen(PORT, async (req, res) => {
  console.log(`Start Your Server With:${PORT}`);
});


module.exports = app;
