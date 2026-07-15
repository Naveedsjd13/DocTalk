const FAKE_ANSWER = "This is a test answer based on the provided context.";

async function* mockStreamAnswer(question, matchedChunks) {
  if (!matchedChunks || matchedChunks.length === 0) {
    yield "I don't have relevant information in this document to answer that.";
    return;
  }
  const words = FAKE_ANSWER.split(" ");
  for (const word of words) {
    yield word + " ";
  }
}

module.exports = {
  streamAnswer: mockStreamAnswer,
  NO_CONTEXT_ANSWER:
    "I don't have relevant information in this document to answer that.",
};
