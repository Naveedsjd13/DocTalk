const groq = require("../config/groq");

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on the provided document context.
Rules:
- Answer ONLY using the information in the context chunks below.
- If the context does not contain enough information to answer, say "I don't have enough information in this document to answer that question." Do not guess or use outside knowledge.
- Reference page numbers naturally when relevant (e.g., "According to page 3...").
- Be concise and direct.`;

const NO_CONTEXT_ANSWER =
  "I don't have relevant information in this document to answer that.";

const formatChunksForPrompt = (chunks) =>
  chunks
    .map((c, i) => `[Chunk ${i + 1}, Page ${c.pageNumber}]\n${c.content}`)
    .join("\n\n");

const buildMessages = (question, matchedChunks) => {
  const context = formatChunksForPrompt(matchedChunks);
  const userMessage = `Context:\n${context}\n\nQuestion: ${question}`;
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ];
};

const generateAnswer = async (question, matchedChunks) => {
  if (!matchedChunks || matchedChunks.length === 0) {
    return NO_CONTEXT_ANSWER;
  }

  const messages = buildMessages(question, matchedChunks);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.3,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
};

const streamAnswer = async function* (question, matchedChunks) {
  if (!matchedChunks || matchedChunks.length === 0) {
    yield NO_CONTEXT_ANSWER;
    return;
  }

  const messages = buildMessages(question, matchedChunks);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    temperature: 0.3,
    max_tokens: 1024,
    stream: true,
  });

  for await (const chunk of response) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
};

module.exports = { generateAnswer, streamAnswer, NO_CONTEXT_ANSWER };
