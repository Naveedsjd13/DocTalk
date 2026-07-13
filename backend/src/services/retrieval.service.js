const mongoose = require("mongoose");
const Chunk = require("../models/Chunk");

const SCORE_THRESHOLD = 0.75;

const normalizeForDedup = (text) =>
  text.toLowerCase().replace(/\s+/g, " ").trim();

const deduplicate = (chunks) => {
  const seen = [];
  for (const chunk of chunks) {
    const normalized = normalizeForDedup(chunk.content);
    const isDuplicate = seen.some((s) => {
      const shorter =
        normalized.length < s.normalized.length ? normalized : s.normalized;
      const longer =
        normalized.length < s.normalized.length ? s.normalized : normalized;
      return longer.includes(shorter) && shorter.length / longer.length > 0.6;
    });
    if (!isDuplicate) {
      seen.push({ normalized, chunk });
    }
  }
  return seen.map((s) => s.chunk);
};

const searchChunks = async (documentId, questionEmbedding, topK = 5) => {
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: questionEmbedding,
        numCandidates: 100,
        limit: topK,
        filter: { documentId: new mongoose.Types.ObjectId(documentId) },
      },
    },
    {
      $project: {
        _id: 0,
        content: 1,
        pageNumber: 1,
        chunkIndex: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
    {
      $match: { score: { $gte: SCORE_THRESHOLD } },
    },
  ]);

  return deduplicate(results);
};

module.exports = { searchChunks };
