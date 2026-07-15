const mockSearchChunks = jest.fn().mockResolvedValue([
  {
    content: "This is a test chunk from the document.",
    pageNumber: 1,
    chunkIndex: 0,
    score: 0.95,
  },
]);

module.exports = {
  searchChunks: mockSearchChunks,
};
