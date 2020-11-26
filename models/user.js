const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
  gameListIds: { type: [String] },
  followers: { type: [String] },
  following: { type: [String] },
});

module.exports = mongoose.model("user", UserSchema);
