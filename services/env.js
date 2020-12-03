const app = require("../app");

exports.envs = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
};

exports.currEnv = process.env.NODE_ENV;
