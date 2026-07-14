const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    pageCount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    trashedAt: {
      type: Date,
      default: null,
    },
    lastOpenedAt: {
      type: Date,
      default: null,
    },
    gridfsFileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
