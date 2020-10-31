const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameListSchema = new Schema({
  title: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 250 },
  creatorUsername: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
});

module.exports = mongoose.model("GameList", GameListSchema);
