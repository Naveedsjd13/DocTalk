const fs = require("fs");
const path = require("path");
const request = require("supertest");
const app = require("../src/server");
const Chunk = require("../src/models/Chunk");
const { connect, clearCollections } = require("./setup");

jest.mock("pdf-parse", () => require("./mocks/pdf-parse.mock"));
jest.mock("../src/services/embedding.service", () =>
  require("./mocks/embedding.mock")
);

beforeAll(async () => await connect());
afterEach(async () => await clearCollections());

const samplePdf = fs.readFileSync(path.join(__dirname, "fixtures", "sample.pdf"));

const uploadDoc = async (token) => {
  const res = await request(app)
    .post("/api/documents")
    .set("Authorization", `Bearer ${token}`)
    .attach("file", samplePdf, {
      filename: "sample.pdf",
      contentType: "application/pdf",
    });
  return res.body;
};

describe("Documents", () => {
  let token;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Doc User", email: "doc@test.com", password: "Password1" });
    token = res.body.token;
  });

  describe("POST /api/documents", () => {
    it("uploads a PDF and returns 201 with correct shape", async () => {
      const res = await request(app)
        .post("/api/documents")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", samplePdf, {
          filename: "sample.pdf",
          contentType: "application/pdf",
        })
        .expect(201);

      expect(res.body.documentId).toBeDefined();
      expect(res.body.title).toBe("sample.pdf");
      expect(res.body.chunkCount).toBeGreaterThanOrEqual(1);
      expect(res.body.status).toBe("ready");
    });
  });

  describe("GET /api/documents", () => {
    it("returns uploaded documents", async () => {
      const uploadRes = await uploadDoc(token);

      const res = await request(app)
        .get("/api/documents")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0]._id).toBe(uploadRes.documentId);
    });

    it("returns empty for starred filter before starring", async () => {
      await uploadDoc(token);

      const res = await request(app)
        .get("/api/documents?filter=starred")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    it("returns empty for trash filter initially", async () => {
      await uploadDoc(token);

      const res = await request(app)
        .get("/api/documents?filter=trash")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveLength(0);
    });
  });

  describe("GET /api/documents/:id", () => {
    it("returns the document", async () => {
      const uploadRes = await uploadDoc(token);

      const res = await request(app)
        .get(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body._id).toBe(uploadRes.documentId);
      expect(res.body.title).toBe("sample.pdf");
      expect(res.body.lastOpenedAt).toBeDefined();
    });

    it("returns 404 for nonexistent document", async () => {
      const { ObjectId } = require("mongoose").Types;
      const fakeId = new ObjectId();

      await request(app)
        .get(`/api/documents/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });

  describe("PATCH /api/documents/:id", () => {
    it("stars a document", async () => {
      const uploadRes = await uploadDoc(token);

      const res = await request(app)
        .patch(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ isStarred: true })
        .expect(200);

      expect(res.body.isStarred).toBe(true);
    });

    it("renames a document", async () => {
      const uploadRes = await uploadDoc(token);

      const res = await request(app)
        .patch(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Renamed Doc" })
        .expect(200);

      expect(res.body.title).toBe("Renamed Doc");
    });
  });

  describe("Filter after starring", () => {
    it("returns starred documents", async () => {
      const uploadRes = await uploadDoc(token);

      await request(app)
        .patch(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ isStarred: true });

      const res = await request(app)
        .get("/api/documents?filter=starred")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]._id).toBe(uploadRes.documentId);
    });
  });

  describe("DELETE /api/documents/:id (soft delete)", () => {
    it("moves document to trash", async () => {
      const uploadRes = await uploadDoc(token);

      const res = await request(app)
        .delete(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe("Document moved to trash");
    });

    it("excludes trashed from default list", async () => {
      const uploadRes = await uploadDoc(token);

      await request(app)
        .delete(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .get("/api/documents")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveLength(0);
    });

    it("includes trashed in trash filter", async () => {
      const uploadRes = await uploadDoc(token);

      await request(app)
        .delete(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`);

      const res = await request(app)
        .get("/api/documents?filter=trash")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]._id).toBe(uploadRes.documentId);
    });
  });

  describe("POST /api/documents/:id/restore", () => {
    it("restores a trashed document to default list", async () => {
      const uploadRes = await uploadDoc(token);

      await request(app)
        .delete(`/api/documents/${uploadRes.documentId}`)
        .set("Authorization", `Bearer ${token}`);

      await request(app)
        .post(`/api/documents/${uploadRes.documentId}/restore`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const res = await request(app)
        .get("/api/documents")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0]._id).toBe(uploadRes.documentId);
    });
  });

  describe("GET /api/documents/:id/file", () => {
    it("streams the PDF with correct content type", async () => {
      const uploadRes = await uploadDoc(token);

      const res = await request(app)
        .get(`/api/documents/${uploadRes.documentId}/file`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.headers["content-type"]).toMatch(/application\/pdf/);
    });
  });

  describe("DELETE /api/documents/:id/permanent", () => {
    it("permanently deletes document and its chunks", async () => {
      const uploadRes = await uploadDoc(token);
      const docId = uploadRes.documentId;

      const chunksBefore = await Chunk.find({ documentId: docId });
      expect(chunksBefore.length).toBeGreaterThanOrEqual(1);

      await request(app)
        .delete(`/api/documents/${docId}/permanent`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const chunksAfter = await Chunk.find({ documentId: docId });
      expect(chunksAfter).toHaveLength(0);
    });
  });

  describe("Ownership isolation", () => {
    it("returns 404 when another user tries to access document", async () => {
      const uploadRes = await uploadDoc(token);
      const docId = uploadRes.documentId;

      const userBRes = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Other", email: "other@test.com", password: "Password1" });
      const tokenB = userBRes.body.token;

      await request(app)
        .get(`/api/documents/${docId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .expect(404);

      await request(app)
        .patch(`/api/documents/${docId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "Hacked" })
        .expect(404);

      await request(app)
        .delete(`/api/documents/${docId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .expect(404);
    });
  });
});
