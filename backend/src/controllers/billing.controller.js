const User = require("../models/User");
const Document = require("../models/Document");
const planLimits = require("../config/planLimits");

const getPlan = async (req, res) => {
  try {
    const userDoc = req.userDoc || (await User.findById(req.user.id));

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const limits = planLimits[userDoc.plan];
    const docCount = await Document.countDocuments({
      userId: req.user.id,
      isTrashed: false,
    });

    res.status(200).json({
      plan: userDoc.plan,
      limits,
      usage: {
        documents: docCount,
        questionsThisMonth: userDoc.questionsUsedThisMonth,
        usageResetAt: userDoc.usageResetAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upgrade = async (req, res) => {
  try {
    const userDoc = await User.findById(req.user.id);

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    userDoc.plan = "pro";
    await userDoc.save();

    res.status(200).json({
      plan: userDoc.plan,
      message: "Upgraded (stub — no payment processed)",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPlan, upgrade };
