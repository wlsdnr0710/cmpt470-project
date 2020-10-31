const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameListSchema = Schema({
  title: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 250 },
  creatorUsername: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
});

// Note: get does not work with an arrow function.
GameListSchema.virtual("testUrl").get(function () {
  return "/testdb/details/" + this._id;
});

module.exports = mongoose.model("GameList", GameListSchema);
