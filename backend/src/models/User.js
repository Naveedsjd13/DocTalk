const mongoose = require("mongoose");

// A user is valid if it has EITHER passwordHash OR googleId (enforced in controller logic).
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    questionsUsedThisMonth: {
      type: Number,
      default: 0,
    },
    usageResetAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

userSchema.index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $type: "string" } } });

module.exports = mongoose.model("User", userSchema);
