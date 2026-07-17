const Document = require("../models/Document");
const User = require("../models/User");
const planLimits = require("../config/planLimits");

const checkDocumentLimit = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user.id);

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const limits = planLimits[userDoc.plan];
    const docCount = await Document.countDocuments({
      userId: req.user.id,
      isTrashed: false,
    });

    if (docCount >= limits.maxDocuments) {
      return res.status(403).json({
        error: `Document limit reached. Your ${userDoc.plan} plan allows ${limits.maxDocuments} documents.`,
        limit: limits.maxDocuments,
      });
    }

    req.userDoc = userDoc;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkQuestionLimit = async (req, res, next) => {
  try {
    const userDoc = await User.findById(req.user.id);

    if (!userDoc) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const resetMonth = userDoc.usageResetAt.getMonth();
    const resetYear = userDoc.usageResetAt.getFullYear();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (resetYear < currentYear || (resetYear === currentYear && resetMonth < currentMonth)) {
      userDoc.questionsUsedThisMonth = 0;
      userDoc.usageResetAt = now;
      await userDoc.save();
    }

    const limits = planLimits[userDoc.plan];

    if (userDoc.questionsUsedThisMonth >= limits.maxQuestionsPerMonth) {
      return res.status(403).json({
        error: `Monthly question limit reached. Your ${userDoc.plan} plan allows ${limits.maxQuestionsPerMonth} questions per month.`,
        limit: limits.maxQuestionsPerMonth,
      });
    }

    userDoc.questionsUsedThisMonth += 1;
    await userDoc.save();

    req.userDoc = userDoc;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { checkDocumentLimit, checkQuestionLimit };
