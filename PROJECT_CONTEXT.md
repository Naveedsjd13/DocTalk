# DocTalk — Project Context

## Overview

DocTalk is a RAG (Retrieval-Augmented Generation) API. Users upload PDFs, the backend chunks and embeds the text into MongoDB Atlas, and answers questions by retrieving relevant chunks and passing them to an LLM.

**Stack:** Node.js, Express, MongoDB Atlas (with Atlas Vector Search), Google Gemini (embeddings), Groq / Llama 3.3 (generation), multer + pdf-parse (file handling), custom JWT auth.

---

## Folder Structure

```
backend/
├── .env
├── package.json
└── src/
    ├── server.js                         # Express app entrypoint
    ├── config/
    │   ├── db.js                         # Mongoose connection
    │   ├── gemini.js                     # Google GenAI client (embeddings)
    │   └── groq.js                       # Groq client (LLM generation)
    ├── models/
    │   ├── User.js
    │   ├── Document.js
    │   ├── Chunk.js
    │   ├── Conversation.js
    │   └── Message.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── document.routes.js
    │   ├── conversation.routes.js
    │   └── health.routes.js              # (empty, health endpoint is inline in server.js)
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── document.controller.js
    │   └── conversation.controller.js
    ├── services/
    │   ├── auth.service.js               # bcrypt hashing, JWT generation
    │   ├── chunking.service.js           # PDF text chunking
    │   ├── embedding.service.js          # Gemini embedding calls
    │   ├── retrieval.service.js          # Atlas $vectorSearch aggregation
    │   └── llm.service.js               # Groq answer generation
    └── middleware/
        ├── auth.middleware.js            # JWT verification, sets req.user
        └── upload.middleware.js          # multer config (memory, 20MB PDFs)
```

Module system: CommonJS (`require` / `module.exports`). No `"type": "module"`.

---

## Environment Variables

```
PORT=3000
MONGODB_URL=mongodb+srv://...
JWT_SECRET=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
```

---

## Database Schema

### `users`
```js
{
  name:           String,   // required, trimmed
  email:          String,   // required, unique, lowercase, trimmed
  passwordHash:   String,   // required, bcrypt-hashed
  createdAt/updatedAt      // timestamps: true
}
```

### `documents`
```js
{
  userId:     ObjectId (ref User),   // required
  title:      String,                // required, set to original filename
  pageCount:  Number,                // set after PDF parsing
  status:     String,                // enum: "processing" | "ready" | "failed", default "processing"
  createdAt/updatedAt                // timestamps: true
}
```

### `chunks`
```js
{
  documentId:  ObjectId (ref Document),   // required
  content:     String,                     // required
  pageNumber:  Number,                     // required
  chunkIndex:  Number,                     // required
  embedding:   [Number],                   // default: undefined (not stored when absent)
  createdAt/updatedAt                      // timestamps: true
}
```

Atlas Vector Search index on `chunks.embedding` (768 dimensions, cosine, filtered by `documentId`). Created in the Atlas UI, not in code.

### `conversations`
```js
{
  userId:       ObjectId (ref User),        // required
  documentIds:  [ObjectId (ref Document)],  // required, array (supports multi-document later)
  title:        String,                     // default null, not yet generated
  createdAt/updatedAt                       // timestamps: true
}
```

### `messages`
```js
{
  conversationId:  ObjectId (ref Conversation),   // required
  role:            String,                         // enum: "user" | "assistant", required
  content:         String,                         // required
  citations:       [{                               // default []
    pageNumber: Number,
    chunkIndex: Number,
    score:      Number
  }],
  createdAt                                         // timestamps: true (no updatedAt needed)
}
```

---

## API Endpoints

All protected routes require `Authorization: Bearer <jwt>`.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | No | Returns `{ status: "ok" }` |
| POST | `/api/auth/signup` | No | Create account. Body: `{ name, email, password }`. Returns `{ token, user }` |
| POST | `/api/auth/login` | No | Login. Body: `{ email, password }`. Returns `{ token, user }` |
| GET | `/api/auth/me` | Yes | Current user profile |
| POST | `/api/documents` | Yes | Upload PDF (multipart, field: `file`). Synchronous — returns after chunking + embedding completes |
| POST | `/api/conversations` | Yes | Start conversation. Body: `{ documentId }`. Verifies document ownership. Returns `201` |
| GET | `/api/conversations` | Yes | List user's conversations, sorted by `updatedAt` desc |
| GET | `/api/conversations/:id` | Yes | Get conversation + all messages (sorted by `createdAt` ascending). Ownership verified |
| POST | `/api/conversations/:id/messages` | Yes | Send a question. Body: `{ question }`. Runs retrieval pipeline, saves both messages, returns `{ question, answer, matchedChunks }` |

---

## Pipeline: Upload

`POST /api/documents` (synchronous, client waits)

1. multer receives PDF, validates type + size (20MB max)
2. `Document.create()` with `status: "processing"`
3. `pdf-parse` extracts text, split by form-feed into pages
4. Each page cleaned + chunked (~600 chars, ~100 char overlap), stored as `Chunk` documents
5. `embedChunksForDocument()` — batched Gemini calls (8 per batch, 1s delay between batches), stores vectors in `chunk.embedding`
6. `document.status` set to `"ready"` (or `"failed"` on error)

## Pipeline: Query

`POST /api/conversations/:id/messages`

1. Verify conversation exists and belongs to `req.user.id`
2. Save user message to `messages` collection
3. Embed question via Gemini (`embedText()`)
4. Atlas `$vectorSearch` aggregation on `chunks.embedding` — top 5 candidates, filtered by `documentId`, threshold ≥ 0.75, deduplicated
5. Groq / Llama 3.3 generates answer from retrieved chunks
6. Save assistant message with citations (`[{ pageNumber, chunkIndex, score }]`)
7. Touch conversation's `updatedAt`
8. Return `{ question, answer, matchedChunks }`

---

## Auth Strategy

Custom JWT auth — no third-party provider. `bcrypt` hashes passwords, `jsonwebtoken` signs tokens with 7-day expiry.

`auth.middleware.js` extracts the Bearer token, verifies it, and sets `req.user = { id: userId }`. Every protected controller filters by `userId` in its Mongo queries — there is no database-level row security, so ownership enforcement is entirely in application code.

---

## Coding Conventions

- CommonJS modules, `module.exports = { name1, name2 }` pattern
- Controllers: `async/await` with single top-level `try/catch`, catch returns `res.status(500).json({ message: error.message })`
- Manual inline validation at top of controller functions, early return on failure
- Ownership checks: `Model.findOne({ _id: req.params.id, userId: req.user.id })` — single query, 404 if null
- No validation library (no express-validator, no zod)
- Flat JSON responses — no `{ success: true, data: ... }` wrapper
- File naming: `kebab-case.js` for routes/controllers/services/middleware, `PascalCase.js` for Mongoose models
- Constants: `UPPER_SNAKE_CASE` (e.g. `CHUNK_SIZE`, `SCORE_THRESHOLD`)
