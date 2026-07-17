const planLimits = {
  free: { maxDocuments: 2, maxQuestionsPerMonth: 50, model: "standard" },
  pro: {
    maxDocuments: Infinity,
    maxQuestionsPerMonth: Infinity,
    model: "priority",
  },
};

module.exports = planLimits;
