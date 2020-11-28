const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Status = {
  Active: "ACTIVE",
  Completed: "COMPLETED",
  Dropped: "DROPPED",
};

const GameListSchema = Schema({
  title: { type: String, required: true, maxlength: 50 },
  description: { type: String, maxlength: 250 },
  creatorSteamId: { type: String, required: true },
  createdDate: { type: Date, default: Date.now, required: true },
  gameIds: { type: [Number] }, // Steam game appids
  status: { type: String, enum: Object.values(Status) },
});

// Note: get does not work with an arrow function.
GameListSchema.virtual("testUrl").get(function () {
  return "/testdb/details/" + this._id;
});

GameListSchema.virtual("detailsUrl").get(function () {
  return "/gameDetail/" + this._id;
});

GameListSchema.virtual("printStatus").get(function () {
  switch (this.status) {
    case "ACTIVE":
      return "In progress";
    case "COMPLETED":
      return "Completed";
    case "DROPPED":
      return "Dropped";
    default:
      return "Unknown";
  }
});

GameListSchema.virtual("printDateCreated").get(function () {
  return this.createdDate.toLocaleString("en-CA", {
    timeZone: "America/Vancouver",
  });
});

// Comparator to use for sorting arrays of game lists by status.
// Active -> Completed -> Dropped
function statusComparator(listA, listB) {
  let statuses = Object.values(Status);
  if (!listA.status && !listB.status) return 0;

  let posA = statuses.findIndex(listA.status);
  let posB = statuses.findIndex(listB.status);
  return posA - posB;
}

// Options for sorting. Call sort with an option, e.g.
// sort(gameList, GameList.SortFields.CreatedDate).
const SortFields = {
  Title: "title",
  CreatedDate: "date",
  Status: "status",
};

// Sorts game lists by a field in place. Field options are specified in
// the 'SortFields' object in the import (e.g. GameList.SortFields.Status).
function sort(gameLists, byField) {
  switch (byField) {
    case SortFields.Title:
      return;
    case SortFields.CreatedDate:
      return;
    case SortFields.Status:
      return gameLists.sort(statusComparator);
    default:
      return;
  }
}

exports.model = mongoose.model("GameList", GameListSchema);
exports.Status = Status;
exports.SortFields = SortFields;
exports.sort = sort;
