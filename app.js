const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const SteamStrategy = require("passport-steam").Strategy;
const fs = require("fs");
const formidable = require("express-formidable");

var User = require("./models/user");
//grab steam key
try {
  var steamkey = fs.readFileSync("./token.txt", "utf8");
} catch (err) {
  console.error(err);
}
//passport for persistent login sessions
passport.serializeUser(function (id, done) {
  done(null, id);
});

passport.deserializeUser(function (steamid, done) {
  User.findOne({ id: steamid }, function (err, user) {
    done(err, user);
  });
  //done(null, obj);
});

passport.use(
  new SteamStrategy(
    {
      //i believe this will need to be changed to the domain URL where our site is deployed
      returnURL: "http://localhost:3000/login/steam",
      realm: "http://localhost:3000",
      apiKey: steamkey,
    },
    function (identifier, profile, done) {
      process.nextTick(function () {
        profile.identifier = identifier;
        User.findOne({ id: profile.id }, function (err, user) {
          if (err) return console.log(err);
          //user exists
          if (user) return done(null, profile.id);
          User.create(
            { id: profile.id, username: profile.displayName },
            function (err, user) {
              if (err) return handleError(err);
            }
          );
          return done(null, profile.id);
        });
      });
    }
  )
);

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const testDbRouter = require("./routes/testDb");
const glistsRouter = require("./routes/glists");
const gameDetail = require("./routes/gameDetail");
var loginRouter = require("./routes/login");
const userPageRouter = require("./routes/userPage");

const app = express();

// Connect to MongoDB via Mongoose
const dbUri =
  "mongodb+srv://admin:470project@470-db.tvugr.mongodb.net/470-db?retryWrites=true&w=majority";
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "your secret",
    name: "name of session id",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(formidable());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/login", loginRouter);
app.use("/testdb", testDbRouter);
app.use("/glists", glistsRouter);
app.use("/gameDetail", gameDetail);
app.use("/userPage", userPageRouter);

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
