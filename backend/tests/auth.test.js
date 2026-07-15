const request = require("supertest");
const app = require("../src/server");
const { connect, clearCollections } = require("./setup");

beforeAll(async () => await connect());
afterEach(async () => await clearCollections());

describe("Auth", () => {
  describe("POST /api/auth/signup", () => {
    it("returns 400 for weak password", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test", email: "test@test.com", password: "weak" });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Password must be/);
    });

    it("returns 201 with correct shape for valid signup", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test User", email: "test@test.com", password: "Password1" })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe("string");
      expect(res.body.user).toMatchObject({
        name: "Test User",
        email: "test@test.com",
      });
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.createdAt).toBeDefined();
    });

    it("returns 409 for duplicate email", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test", email: "dup@test.com", password: "Password1" });

      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test2", email: "dup@test.com", password: "Password1" });
      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already in use");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({ name: "Test", email: "login@test.com", password: "Password1" });
    });

    it("returns 200 with token for correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "login@test.com", password: "Password1" })
        .expect(200);

      expect(res.body.token).toBeDefined();
      expect(res.body.user).toMatchObject({
        name: "Test",
        email: "login@test.com",
      });
    });

    it("returns 401 for wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "login@test.com", password: "WrongPass1" });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("returns 401 for nonexistent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@test.com", password: "Password1" });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns 200 with user info for valid token", async () => {
      const signupRes = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Me User", email: "me@test.com", password: "Password1" });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${signupRes.body.token}`)
        .expect(200);

      expect(res.body).toMatchObject({
        name: "Me User",
        email: "me@test.com",
      });
      expect(res.body.id).toBeDefined();
      expect(res.body.createdAt).toBeDefined();
      expect(res.body.passwordHash).toBeUndefined();
    });

    it("returns 401 for no token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });

    it("returns 401 for malformed token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer not.a.valid.token");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Unauthorized");
    });
  });

  describe("POST /api/auth/logout and token revocation", () => {
    it("revokes the token after logout", async () => {
      const signupRes = await request(app)
        .post("/api/auth/signup")
        .send({ name: "Logout", email: "logout@test.com", password: "Password1" });
      const token = signupRes.body.token;

      await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);
      expect(meRes.status).toBe(401);
      expect(meRes.body.message).toBe("Token has been revoked");
    });

    it("allows fresh login after logout", async () => {
      await request(app)
        .post("/api/auth/signup")
        .send({ name: "Fresh", email: "fresh@test.com", password: "Password1" });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "fresh@test.com", password: "Password1" });
      const oldToken = loginRes.body.token;

      await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${oldToken}`)
        .expect(200);

      const newLoginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "fresh@test.com", password: "Password1" });
      expect(newLoginRes.status).toBe(200);
      expect(newLoginRes.body.token).toBeDefined();

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${newLoginRes.body.token}`);
      expect(meRes.status).toBe(200);
      expect(meRes.body.email).toBe("fresh@test.com");
    });
  });
});
