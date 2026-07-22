# Backend Documentation — DocTalk

Node.js / Express REST API for chatting with PDF documents. Handles auth, document uploads, text chunking, embeddings, and RAG-powered chat via Gemini and Groq.

---

## Root Files

### `package.json`

- Project dependencies and scripts
- Key deps: Express, Mongoose, Passport, JWT, bcrypt, pdf-parse, Multer, Groq SDK, Google Generative AI
- Scripts: `start`, `dev`, `test`

### `jest.config.js`

- Jest test configuration

---

## `src/server.js`

- Express app bootstrap and entry point
- Sets up: CORS, JSON parsing, Passport, rate limiting
- Mounts all route groups under `/api/*`
- Connects to MongoDB, then starts listening on PORT
- Exports `app` for testing

---

## `src/config/` — Configuration

### `db.js`

- MongoDB connection via Mongoose
- Connects to `MONGODB_URI` from env

### `gemini.js`

- Google Gemini API client setup
- Initializes `GoogleGenerativeAI` with API key

### `groq.js`

- Groq API client setup (fast LLM inference)
- Initializes Groq SDK with API key

### `gridfs.js`

- GridFS bucket for storing PDF files in MongoDB
- Bucket name: `pdfs`
- Lazy singleton pattern

### `passport.js`

- Passport.js Google OAuth 2.0 strategy
- On login: finds existing user by `googleId` or email, or creates new user
- Links Google account to existing email if user already registered

### `planLimits.js`

- Defines plan limits:
  - `free`: 2 documents, 50 questions/month
  - `pro`: unlimited documents and questions

---

## `src/models/` — Mongoose Models

### `User.js`

- User account
- Fields: `name`, `email`, `passwordHash`, `googleId`, `plan` (free/pro), `questionsUsedThisMonth`, `usageResetAt`
- Timestamps enabled

### `Document.js`

- Uploaded PDF document
- Fields: `userId` (ref User), `title`, `pageCount`, `status` (processing/ready/failed), `isStarred`, `isTrashed`, `trashedAt`, `lastOpenedAt`, `gridfsFileId`
- Timestamps enabled

### `Chunk.js`

- Text chunk from a document (for RAG)
- Fields: `documentId` (ref Document), `content`, `pageNumber`, `chunkIndex`, `embedding` (vector array)
- Timestamps enabled

### `Conversation.js`

- Chat conversation
- Fields: `userId` (ref User), `documentIds` (array of refs to Document), `title`
- Timestamps enabled

### `Message.js`

- Individual chat message
- Fields: `conversationId` (ref Conversation), `role` (user/assistant), `content`, `citations` (array of page/chunk/score)
- Timestamps enabled

### `TokenBlocklist.js`

- Revoked JWT tokens (for logout)
- Fields: `jti` (unique token ID), `expiresAt`
- Auto-expires via MongoDB TTL index

---

## `src/controllers/` — Route Handlers

### `auth.controller.js`

- `signup` — Create new user, validate email/password, return JWT
- `login` — Verify credentials, return JWT
- `logout` — Blocklist current JWT token
- `googleCallback` — Handle Google OAuth callback, return JWT
- `me` — Return current user info (requires auth)

### `document.controller.js`

- `uploadDocument` — Upload PDF: store in GridFS, parse text, chunk it, generate embeddings, save chunks
- `getDocumentFile` — Stream PDF file from GridFS
- `listDocuments` — List user's documents (supports filters: recent, starred, trash)
- `getDocument` — Get single document by ID, update `lastOpenedAt`
- `updateDocument` — Update title or starred status
- `trashDocument` — Soft delete (move to trash)
- `restoreDocument` — Restore from trash
- `permanentDeleteDocument` — Hard delete: remove chunks, GridFS file, and document record

### `conversation.controller.js`

- `createConversation` — Create new conversation for a document
- `getConversation` — Get conversation with all messages
- `listConversations` — List all user's conversations
- `sendMessage` — **Core chat endpoint**: embed question → search chunks → stream LLM answer via SSE → save message with citations

### `billing.controller.js`

- `getPlan` — Get current plan, limits, and usage stats
- `upgrade` — Upgrade to pro plan (stub, no payment processing)

---

## `src/routes/` — Express Routes

### `auth.routes.js`

- `POST /api/auth/signup` — Register (rate limited)
- `POST /api/auth/login` — Login (rate limited)
- `POST /api/auth/logout` — Logout (auth required)
- `GET /api/auth/me` — Get current user (auth required)
- `GET /api/auth/google` — Start Google OAuth
- `GET /api/auth/google/callback` — Google OAuth callback

### `document.routes.js`

- `POST /api/documents/` — Upload document (auth, plan limit check)
- `GET /api/documents/` — List documents (auth)
- `GET /api/documents/:id` — Get document (auth)
- `GET /api/documents/:id/file` — Download PDF file (auth)
- `PATCH /api/documents/:id` — Update document (auth)
- `DELETE /api/documents/:id` — Trash document (auth)
- `POST /api/documents/:id/restore` — Restore from trash (auth, plan limit check)
- `DELETE /api/documents/:id/permanent` — Permanent delete (auth)

### `conversation.routes.js`

- `POST /api/conversations/` — Create conversation (auth)
- `GET /api/conversations/` — List conversations (auth)
- `GET /api/conversations/:id` — Get conversation + messages (auth)
- `POST /api/conversations/:id/messages` — Send message (auth, question limit check)

### `billing.routes.js`

- `GET /api/billing/plan` — Get plan info (auth)
- `POST /api/billing/upgrade` — Upgrade plan (auth)

### `health.routes.js`

- `GET /health` — Health check (returns `{ status: "ok" }`)

---

## `src/middleware/` — Express Middleware

### `auth.middleware.js`

- JWT authentication guard
- Extracts Bearer token, verifies JWT, checks blocklist
- Attaches decoded user to `req.user`

### `error.middleware.js`

- Global error handler
- Returns error status code and message as JSON

### `upload.middleware.js`

- Multer file upload middleware
- Memory storage, 20MB limit, PDF-only filter

### `planLimits.middleware.js`

- `checkDocumentLimit` — Blocks upload if user hit document limit for their plan
- `checkQuestionLimit` — Blocks message if user hit monthly question limit, resets counter on new month

---

## `src/services/` — Core Business Logic

### `auth.service.js`

- `hashPassword(password)` — bcrypt hash (10 rounds)
- `comparePassword(password, hash)` — bcrypt compare
- `generateToken(userId)` — Create JWT with random `jti`, 7-day expiry

### `chunking.service.js`

- `cleanText(text)` — Normalize whitespace
- `chunkText(text)` — Split text into 600-char chunks with 100-char overlap

### `embedding.service.js`

- `embedText(text)` — Generate vector embedding via Gemini (`gemini-embedding-001`, 768 dimensions)
- `embedChunksForDocument(documentId)` — Embed all chunks for a document in batches of 8 with 1s delay

### `retrieval.service.js`

- `searchChunks(documentId, questionEmbedding, topK=5)` — MongoDB vector search to find most relevant chunks (score threshold 0.75), deduplicates results

### `llm.service.js`

- `generateAnswer(question, matchedChunks)` — Non-streaming answer via Groq (llama-3.3-70b)
- `streamAnswer(question, matchedChunks)` — Streaming answer via Groq (async generator)
- Uses system prompt that instructs LLM to answer only from context and cite page numbers

---

## How RAG Works (Request Flow)

1. User uploads PDF → stored in GridFS, text extracted and chunked
2. Chunks get vector embeddings via Gemini API, saved to MongoDB
3. User asks question → question gets embedded
4. Vector search finds top-5 matching chunks (similarity score ≥ 0.75)
5. Chunks + question sent to Groq (llama-3.3-70b) as context
6. LLM streams answer back via Server-Sent Events (SSE)
7. Answer + citations (page numbers) saved to database

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (Mongoose ODM)
- **File Storage:** GridFS (MongoDB)
- **Auth:** Passport.js + JWT (Google OAuth + email/password)
- **Embeddings:** Google Gemini (`gemini-embedding-001`)
- **LLM:** Groq (`llama-3.3-70b-versatile`)
- **Testing:** Jest
