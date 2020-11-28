const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  steamId: { type: String, required: true },
  username: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
  createdgameListIds: { type: [String] },
  ownedGameIds: { type: [Number] },
});

module.exports = mongoose.model("user", UserSchema);
