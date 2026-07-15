const fs = require("fs");
const path = require("path");
const request = require("supertest");
const app = require("../src/server");
const Message = require("../src/models/Message");
const { connect, clearCollections } = require("./setup");

jest.mock("pdf-parse", () => require("./mocks/pdf-parse.mock"));
jest.mock("../src/services/embedding.service", () =>
  require("./mocks/embedding.mock")
);
jest.mock("../src/services/llm.service", () => require("./mocks/llm.mock"));
jest.mock("../src/services/retrieval.service", () =>
  require("./mocks/retrieval.mock")
);

beforeAll(async () => await connect());
afterEach(async () => await clearCollections());

const samplePdf = fs.readFileSync(path.join(__dirname, "fixtures", "sample.pdf"));

describe("Chat", () => {
  let token;
  let docId;
  let conversationId;

  beforeEach(async () => {
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Chat User", email: "chat@test.com", password: "Password1" });
    token = signupRes.body.token;

    const uploadRes = await request(app)
      .post("/api/documents")
      .set("Authorization", `Bearer ${token}`)
      .attach("file", samplePdf, {
        filename: "sample.pdf",
        contentType: "application/pdf",
      });
    docId = uploadRes.body.documentId;

    const convRes = await request(app)
      .post("/api/conversations")
      .set("Authorization", `Bearer ${token}`)
      .send({ documentId: docId });
    conversationId = convRes.body._id;
  });

  describe("POST /api/conversations", () => {
    it("creates a conversation with correct shape", async () => {
      const res = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({ documentId: docId })
        .expect(201);

      expect(res.body._id).toBeDefined();
      expect(res.body.userId).toBeDefined();
      expect(res.body.documentIds).toContain(docId);
    });

    it("returns 400 without documentId", async () => {
      const res = await request(app)
        .post("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("documentId is required");
    });
  });

  describe("GET /api/conversations/:id", () => {
    it("returns conversation with empty messages initially", async () => {
      const res = await request(app)
        .get(`/api/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.conversation._id).toBe(conversationId);
      expect(res.body.messages).toHaveLength(0);
    });
  });

  describe("POST /api/conversations/:id/messages", () => {
    it("streams SSE response and saves messages", async () => {
      const msgRes = await request(app)
        .post(`/api/conversations/${conversationId}/messages`)
        .set("Authorization", `Bearer ${token}`)
        .send({ question: "What is this document about?" })
        .expect(200);

      // Parse SSE events from the response body
      // NOTE: supertest collects the full streaming response as text before returning
      const events = msgRes.text
        .split("\n\n")
        .filter(Boolean)
        .map((event) => JSON.parse(event.replace("data: ", "")));

      const contentEvents = events.filter((e) => e.content !== undefined);
      expect(contentEvents.length).toBeGreaterThan(0);

      const doneEvent = events.find((e) => e.done === true);
      expect(doneEvent).toBeDefined();
      expect(doneEvent.matchedChunks).toBeDefined();

      // Verify messages were saved to the database
      const convRes = await request(app)
        .get(`/api/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(convRes.body.messages).toHaveLength(2);
      expect(convRes.body.messages[0].role).toBe("user");
      expect(convRes.body.messages[0].content).toBe(
        "What is this document about?"
      );
      expect(convRes.body.messages[1].role).toBe("assistant");
      expect(convRes.body.messages[1].content).toContain(
        "This is a test answer"
      );
      expect(convRes.body.messages[1].citations).toBeDefined();
      expect(convRes.body.messages[1].citations.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/conversations", () => {
    it("lists conversations", async () => {
      const res = await request(app)
        .get("/api/conversations")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0]._id).toBe(conversationId);
    });
  });

  describe("Ownership isolation", () => {
    it("returns 404 when another user tries to access conversation", async () => {
      const userBRes = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Other", email: "other@test.com", password: "Password1" });
      const tokenB = userBRes.body.token;

      await request(app)
        .get(`/api/conversations/${conversationId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .expect(404);
    });
  });
});
