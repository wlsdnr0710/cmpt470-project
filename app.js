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

var User = require("./models/user");
//grab steam key
try {
  var steamkey = fs.readFileSync('./token.txt', 'utf8')
} catch (err) {
  console.error(err)
}
//passport for persistent login sessions
passport.serializeUser(function(id, done) {
  done(null, id);
})

passport.deserializeUser(function(steamid, done) {
  User.findOne({ id: steamid }, function(err, user) {
    done(err, user);
  });
  //done(null, obj);
})

passport.use(new SteamStrategy({
  returnURL: 'http://localhost:3000/login/steam/return',
  realm: 'http://localhost:3000',
  apiKey: steamkey
  },
  function(identifier, profile, done) {
    process.nextTick(function () {
      profile.identifier = identifier;
      //TODO: similar to passport, associate steam id with user in database and return the user
      //for now just returning the steam user
      User.findOne({id: profile.id }, function(err, doc) {
        if(err) {
          console.log(err);
        }
        else {
          if(doc) {//user exists, return the found user from db
            return done(null, profile.id);
          }
          else {//create a new user
            User.create({ id: profile.id, username: profile.displayName }, function(err, user) {
              if(err) return handleError(err);
            });
            return done(null, profile.id);
          }
        }
      })
      //return done(null, profile);
    });
  }
));
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const testDbRouter = require("./routes/testDb");
const glistsRouter = require("./routes/glists");
const gameList = require("./models/gameList");

var loginRouter = require('./routes/login');
const user = require("./models/user");
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
app.use(session({
  secret: 'your secret',
  name: 'name of session id',
  resave: true,
  saveUninitialized: true}));


app.use(passport.initialize());
app.use(passport.session());


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use("/testdb", testDbRouter);
app.use("/glists", glistsRouter);

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

