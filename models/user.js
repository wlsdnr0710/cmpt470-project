const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameList = require("../models/gameList");

const UserSchema = new Schema({
  steamId: { type: String, required: true },
  username: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
  gameListIds: { type: [String] },
  ownedGameIds: { type: [Number] },
  followers: { type: [String] },
  following: { type: [String] },
});

UserSchema.methods.numCompletedLists = async function () {
  const userGameLists = await GameList.model.find({ creatorSteamId: this.steamId });
  let completedLists = userGameLists.filter((gl) => 
    gl.status == GameList.Status.Completed
  );
  return completedLists.length;
};

module.exports = mongoose.model("user", UserSchema);
