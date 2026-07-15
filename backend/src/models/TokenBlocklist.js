const mongoose = require("mongoose");

const tokenBlocklistSchema = new mongoose.Schema({
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

tokenBlocklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TokenBlocklist", tokenBlocklistSchema);
