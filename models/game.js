const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema to hold Steam game information. Matches name of keys in actual GetOwnedGames call.
const GameSchema = Schema({
  appid: { type: Number, required: true },
  name: { type: String, required: true },
  playtime_forever: { type: Number, required: true },
  img_icon_url: { type: String, required: true },
  img_logo_url: { type: String, required: true },
});

module.exports = mongoose.model("Game", GameSchema);
