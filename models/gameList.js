const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameListSchema = Schema({
  title: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 250 },
  creatorSteamId: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
  gameIds: { type: [Number] }, // Steam game appids
  status: { type: String, enum: ["ACTIVE", "COMPLETED", "DROPPED"] },
});

// Note: get does not work with an arrow function.
GameListSchema.virtual("testUrl").get(function () {
  return "/testdb/details/" + this._id;
});

GameListSchema.virtual("detailsUrl").get(function () {
  return "/gameDetail/" + this._id;
});

module.exports = mongoose.model("GameList", GameListSchema);
