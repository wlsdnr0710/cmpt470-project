const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Status = {
  Active: "ACTIVE",
  Completed: "COMPLETED",
  Awaiting: "AWAITING",
  Dropped: "DROPPED",
};

const GameListSchema = Schema({
  title: { type: String, required: true, maxlength: 50 },
  creatorSteamId: { type: String, required: true },
  description: { type: String, maxlength: 250 },
  createdDate: { type: Date, default: Date.now, required: true },
  gameIds: { type: [Number] }, // Steam game appids
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.Awaiting,
  },
});

GameListSchema.virtual("detailsUrl").get(function () {
  return "/database/details/" + this._id;
});

GameListSchema.virtual("deleteUrl").get(function () {
  return "/database/delete/" + this._id;
});

GameListSchema.virtual("printStatus").get(function () {
  switch (this.status) {
    case Status.Active:
      return "In Progress";
    case Status.Completed:
      return "Completed";
    case Status.Awaiting:
      return "Awaiting";
    case Status.Dropped:
      return "Dropped";
    default:
      throw "Status being printed not handled";
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

  let posA = statuses.findIndex((status) => status === listA.status);
  let posB = statuses.findIndex((status) => status === listB.status);
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
function sort(gameLists, onField) {
  switch (onField) {
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
