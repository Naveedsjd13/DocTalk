const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Document = require("../models/Document");
const { embedText } = require("../services/embedding.service");
const { searchChunks } = require("../services/retrieval.service");
const { generateAnswer } = require("../services/llm.service");

const createConversation = async (req, res) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res
        .status(400)
        .json({ message: "documentId is required" });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const conversation = await Conversation.create({
      userId: req.user.id,
      documentIds: [documentId],
    });

    res.status(201).json({
      _id: conversation._id,
      userId: conversation.userId,
      documentIds: conversation.documentIds,
      title: conversation.title,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      userId: req.user.id,
    }).sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res
        .status(400)
        .json({ message: "question is required" });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const documentId = conversation.documentIds[0];

    await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: question,
    });

    const questionEmbedding = await embedText(question);
    const matchedChunks = await searchChunks(documentId, questionEmbedding);
    const answer = await generateAnswer(question, matchedChunks);

    const citations = matchedChunks.map((chunk) => ({
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
      score: chunk.score,
    }));

    await Message.create({
      conversationId: conversation._id,
      role: "assistant",
      content: answer,
      citations,
    });

    // Touch updatedAt so Mongoose timestamps stay current
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json({ question, answer, matchedChunks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createConversation,
  getConversation,
  listConversations,
  sendMessage,
};
