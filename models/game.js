const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema to hold Steam game information.
const GameSchema = Schema({
  appId: { type: Number, required: true },
  name: { type: String, required: true },
  playtimeForever: { type: Number, required: true },
  imgIconUrl: { type: String, required: true },
  imgLogoUrl: { type: String, required: true },
});

module.exports = mongoose.model("Game", GameSchema);
