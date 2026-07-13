const genAI = require("../config/gemini");
const Chunk = require("../models/Chunk");

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 1000;

const embedText = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: 768,
  });
  return result.embedding.values;
};

const embedChunksForDocument = async (documentId) => {
  const chunks = await Chunk.find({ documentId });

  if (chunks.length === 0) return 0;

  let embedded = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (chunk) => {
        const embedding = await embedText(chunk.content);
        await Chunk.updateOne({ _id: chunk._id }, { $set: { embedding } });
        return chunk._id;
      })
    );

    results.forEach((r) => {
      if (r.status === "rejected") console.error("Embedding failed:", r.reason);
    });

    embedded += results.filter((r) => r.status === "fulfilled").length;

    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  if (embedded === 0) {
    throw new Error("Embedding failed for all chunks");
  }

  return embedded;
};

module.exports = { embedText, embedChunksForDocument };
