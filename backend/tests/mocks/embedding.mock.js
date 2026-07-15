const EMBEDDING_DIMENSION = 768;

const mockEmbedText = jest.fn().mockResolvedValue(
  new Array(EMBEDDING_DIMENSION).fill(0.1)
);

const mockEmbedChunksForDocument = jest.fn().mockResolvedValue(1);

module.exports = {
  embedText: mockEmbedText,
  embedChunksForDocument: mockEmbedChunksForDocument,
};
