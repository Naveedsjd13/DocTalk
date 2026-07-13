const CHUNK_SIZE = 600;
const CHUNK_OVERLAP = 100;

const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const chunkText = (text) => {
  if (!text) return [];

  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
    if (start >= text.length) break;
  }

  return chunks;
};

module.exports = { cleanText, chunkText };
