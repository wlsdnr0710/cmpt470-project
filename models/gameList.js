const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let GameListSchema = new Schema({
  title: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 250 },
  creatorUsername: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
});

GameListSchema.virtual("testUrl").get(() => {
  return "/testdb/gamelist/" + this._id;
});

module.exports = mongoose.model("GameList", GameListSchema);
