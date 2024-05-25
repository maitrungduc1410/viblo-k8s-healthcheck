const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const state = require("./state");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// global middleware
app.use(function (req, res, next) {
  if (!state.isAppAlive) {
    return next(createError(500));
  }

  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);

// Simulate a long startup time
setTimeout(() => {
  state.isAppReady = true;
}, 30000); // 30 seconds

app.get("/healthz", (req, res) => {
  res.send("OK");
});

app.get("/readiness", (req, res) => {
  if (state.isAppReady) {
    res.send("Ready");
  } else {
    res.status(503).send("Not Ready");
  }
});

app.get("/liveness", (req, res) => {
  res.send("Alive");
});

// To simulate a failure, you can expose an endpoint to turn off liveness
app.get("/kill", (req, res) => {
  state.isAppAlive = false;
  res.send("App will be marked as dead");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
