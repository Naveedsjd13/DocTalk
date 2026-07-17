const express = require("express");
const auth = require("../middleware/auth.middleware");
const { checkQuestionLimit } = require("../middleware/planLimits.middleware");
const {
  createConversation,
  getConversation,
  listConversations,
  sendMessage,
} = require("../controllers/conversation.controller");

const router = express.Router();

router.post("/", auth, createConversation);
router.get("/", auth, listConversations);
router.get("/:id", auth, getConversation);
router.post("/:id/messages", auth, checkQuestionLimit, sendMessage);

module.exports = router;
