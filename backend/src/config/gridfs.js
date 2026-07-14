const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;

const getGridFSBucket = () => {
  if (bucket) return bucket;

  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection not established");
  }

  bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "pdfs" });
  return bucket;
};

module.exports = getGridFSBucket;
