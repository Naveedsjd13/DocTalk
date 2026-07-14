const pdfParse = require("pdf-parse");
const Document = require("../models/Document");
const Chunk = require("../models/Chunk");
const { chunkText, cleanText } = require("../services/chunking.service");
const { embedChunksForDocument } = require("../services/embedding.service");
const getGridFSBucket = require("../config/gridfs");

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
    // Stream raw PDF to GridFS
    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: "application/pdf",
    });

    await new Promise((resolve, reject) => {
      uploadStream.on("error", reject);
      uploadStream.on("finish", resolve);
      uploadStream.end(req.file.buffer);
    });

    document.gridfsFileId = uploadStream.id;

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

const getDocumentFile = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!document.gridfsFileId) {
      return res.status(404).json({ message: "File not available" });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(document.gridfsFileId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${document.title}"`,
    });

    downloadStream.on("error", () => {
      res.status(404).json({ message: "File not found" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listDocuments = async (req, res) => {
  try {
    const { filter } = req.query;
    const query = { userId: req.user.id };
    let sort = { createdAt: -1 };

    if (filter === "recent") {
      query.isTrashed = false;
      sort = { lastOpenedAt: -1 };
    } else if (filter === "starred") {
      query.isStarred = true;
      query.isTrashed = false;
    } else if (filter === "trash") {
      query.isTrashed = true;
    } else {
      query.isTrashed = false;
    }

    let queryBuilder = Document.find(query).sort(sort);

    if (filter === "recent") {
      queryBuilder = queryBuilder.limit(20);
    }

    const documents = await queryBuilder;

    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.lastOpenedAt = new Date();
    await document.save();

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { title, isStarred } = req.body;
    const updates = {};

    if (title !== undefined) updates.title = title;
    if (isStarred !== undefined) updates.isStarred = isStarred;

    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const trashDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.isTrashed = true;
    document.trashedAt = new Date();
    await document.save();

    res.status(200).json({ message: "Document moved to trash" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const restoreDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    document.isTrashed = false;
    document.trashedAt = null;
    await document.save();

    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const permanentDeleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await Chunk.deleteMany({ documentId: document._id });

    if (document.gridfsFileId) {
      try {
        const bucket = getGridFSBucket();
        await bucket.delete(document.gridfsFileId);
      } catch (err) {
        console.error("GridFS cleanup failed:", err.message);
      }
    }

    await Document.deleteOne({ _id: document._id });

    res.status(200).json({ message: "Document permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocumentFile,
  listDocuments,
  getDocument,
  updateDocument,
  trashDocument,
  restoreDocument,
  permanentDeleteDocument,
};
