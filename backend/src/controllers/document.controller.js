const pdfParse = require("pdf-parse");
const Document = require("../models/Document");
const Chunk = require("../models/Chunk");
const { chunkText, cleanText } = require("../services/chunking.service");
const { embedChunksForDocument } = require("../services/embedding.service");

const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const document = await Document.create({
    userId: req.user.id,
    title: req.file.originalname,
    status: "processing",
  });

  try {
    const pdfData = await pdfParse(req.file.buffer);
    const pages = pdfData.text.split(/\f/).filter((p) => p.trim());
    const allChunks = [];

    pages.forEach((pageText, i) => {
      const pageNumber = i + 1;
      const cleaned = cleanText(pageText);
      const textChunks = chunkText(cleaned);

      textChunks.forEach((content, chunkIndex) => {
        allChunks.push({
          documentId: document._id,
          content,
          pageNumber,
          chunkIndex,
        });
      });
    });

    if (allChunks.length > 0) {
      await Chunk.insertMany(allChunks);
    }

    document.pageCount = pages.length;
    await document.save();

    await embedChunksForDocument(document._id);

    document.status = "ready";
    await document.save();

    res.status(201).json({
      documentId: document._id,
      title: document.title,
      chunkCount: allChunks.length,
      status: document.status,
    });
  } catch (error) {
    document.status = "failed";
    await document.save();

    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument };
