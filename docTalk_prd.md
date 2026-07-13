# DocTalk — Backend PRD

**For: Naveed + AI Coding Agent**
**Version:** 2.0 (MongoDB stack)
**Approach:** Backend-first. Every endpoint built and verified in Postman before any frontend wiring.

---

## 1. Overview

DocTalk's backend is a RAG (Retrieval-Augmented Generation) API. It accepts PDF uploads, chunks and embeds their text, stores vectors in MongoDB, and answers user questions by retrieving relevant chunks and passing them to an LLM.

**Stack:**

- **Runtime:** Node.js + Express
- **Database:** MongoDB Atlas (with Atlas Vector Search for embeddings)
- **Embeddings:** Google Gemini (`text-embedding-004` or current equivalent)
- **LLM (answers):** Groq (Llama or current fast model)
- **File handling:** `multer` for uploads, `pdf-parse` (or similar) for text extraction
- **File storage:** GridFS (MongoDB's built-in file storage) — no separate storage service needed
- **Auth:** Custom JWT auth (`jsonwebtoken` + `bcrypt`) — no Supabase Auth equivalent, build it directly

---

## 2. Folder Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── health.routes.js
│   │   ├── documents.routes.js
│   │   ├── chat.routes.js
│   │   └── auth.routes.js
│   ├── controllers/
│   │   ├── documents.controller.js
│   │   ├── chat.controller.js
│   │   └── auth.controller.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   ├── Chunk.js
│   │   ├── Conversation.js
│   │   └── Message.js
│   ├── services/
│   │   ├── chunking.service.js       # splits PDF text into chunks
│   │   ├── embedding.service.js      # calls Gemini, returns vectors
│   │   ├── retrieval.service.js      # vector search in MongoDB Atlas
│   │   └── llm.service.js            # calls Groq for answers
│   ├── middleware/
│   │   ├── auth.middleware.js        # verifies JWT
│   │   ├── upload.middleware.js      # multer config
│   │   └── error.middleware.js
│   ├── config/
│   │   ├── db.js                     # mongoose connection
│   │   ├── gemini.js
│   │   └── groq.js
│   └── server.js
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## 3. Environment Variables (`.env.example`)

```
PORT=3000
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
GROQ_API_KEY=
MAX_UPLOAD_SIZE_MB=20
```

---

## 4. Database Schema (MongoDB / Mongoose)

Use Mongoose models. Collections:

**`users`**

```js
{
  _id: ObjectId,
  email: String,        // unique
  passwordHash: String,
  createdAt: Date
}
```

**`documents`**

```js
{
  _id: ObjectId,
  userId: ObjectId,       // ref: User
  title: String,
  gridfsFileId: ObjectId, // pointer to the stored PDF in GridFS
  pageCount: Number,
  status: String,          // 'processing' | 'ready' | 'failed'
  isStarred: Boolean,
  isTrashed: Boolean,
  trashedAt: Date,
  createdAt: Date,
  lastOpenedAt: Date
}
```

**`chunks`**

```js
{
  _id: ObjectId,
  documentId: ObjectId,   // ref: Document
  content: String,
  pageNumber: Number,
  chunkIndex: Number,
  embedding: [Number],    // vector, length depends on Gemini model (e.g. 768)
  createdAt: Date
}
```

Create an **Atlas Vector Search index** on `chunks.embedding` (done in the Atlas UI, not in code):

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

The `documentId` filter field lets you scope similarity search to one or more documents at query time.

**`conversations`**

```js
{
  _id: ObjectId,
  userId: ObjectId,
  documentIds: [ObjectId],  // supports multi-document chat
  title: String,
  createdAt: Date
}
```

**`messages`**

```js
{
  _id: ObjectId,
  conversationId: ObjectId,
  role: String,           // 'user' | 'assistant'
  content: String,
  citations: [             // [{ page: 4, chunkId: "..." }, ...]
    { page: Number, chunkId: ObjectId }
  ],
  createdAt: Date
}
```

Access control: every query on `documents`, `conversations`, and `messages` must filter by `userId` (or via the parent conversation's `userId`) at the application layer — Mongo has no built-in row-level security, so `auth.middleware.js` attaching `req.user` and every controller respecting it is what keeps users' data isolated.

---

## 5. API Endpoints

### 5.1 Health

| Method | Route     | Purpose                                           |
| ------ | --------- | ------------------------------------------------- |
| GET    | `/health` | Returns `{ status: "ok" }`. First thing to build. |

### 5.2 Auth

| Method | Route          | Purpose                                                                                                  |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------- |
| POST   | `/auth/signup` | Create account (hash password with bcrypt, save user)                                                    |
| POST   | `/auth/login`  | Verify password, return signed JWT                                                                       |
| POST   | `/auth/logout` | Client-side token discard (stateless JWT — nothing to invalidate server-side unless you add a blocklist) |
| GET    | `/auth/me`     | Return current user profile (from verified JWT)                                                          |

_(No built-in OAuth like Supabase gives you — if you want Google login later, you'd add `passport-google-oauth20` as a separate task. Not in scope for v1.)_

### 5.3 Documents

| Method | Route                      | Purpose                                                                                                                                               |
| ------ | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/documents`               | Upload a PDF (multipart/form-data). Saves file to GridFS, extracts text, chunks it, kicks off embedding, returns document `id` + `status: processing` |
| GET    | `/documents`               | List user's documents. Query params: `?filter=recent\|starred\|trash`                                                                                 |
| GET    | `/documents/:id`           | Get single document metadata + processing status                                                                                                      |
| PATCH  | `/documents/:id`           | Rename, star/unstar                                                                                                                                   |
| DELETE | `/documents/:id`           | Soft delete (`isTrashed=true`, `trashedAt=now()`)                                                                                                     |
| POST   | `/documents/:id/restore`   | Restore from trash                                                                                                                                    |
| DELETE | `/documents/:id/permanent` | Hard delete (removes document row + GridFS file + chunk rows)                                                                                         |

### 5.4 Chat

| Method | Route                         | Purpose                                                                                                                                                                |
| ------ | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/conversations`              | Start a new conversation for one or more `documentIds`                                                                                                                 |
| GET    | `/conversations/:id`          | Get conversation + message history                                                                                                                                     |
| POST   | `/conversations/:id/messages` | Send a question. Embeds question → vector search top-k chunks → calls Groq → **streams response** (Server-Sent Events or chunked response) → saves message + citations |
| GET    | `/conversations`              | List user's conversations (for history/sidebar if needed later)                                                                                                        |

### 5.5 Settings / Billing (stub for now)

| Method | Route              | Purpose                                             |
| ------ | ------------------ | --------------------------------------------------- |
| GET    | `/billing/plan`    | Return current plan (`free` or `pro`) + usage stats |
| POST   | `/billing/upgrade` | Stub — wire to real payment provider later          |

---

## 6. Core Pipeline Logic

### 6.1 Upload → Chunk → Embed (triggered by `POST /documents`)

1. Receive PDF via `multer`, validate type + size (`MAX_UPLOAD_SIZE_MB`)
2. Stream the raw file into GridFS, save the returned file id as `gridfsFileId`
3. Extract text per page using `pdf-parse`
4. Chunk each page's text (~500–800 tokens per chunk, ~100 token overlap) — keep `pageNumber` attached to every chunk
5. For each chunk, call `embedding.service.js` → Gemini → get vector
6. Insert chunk documents (content, pageNumber, embedding) into `chunks` collection
7. Update `documents.status` to `ready` (or `failed` with an error reason)

_Do this asynchronously — don't make the client wait on the whole pipeline. Return `202 Accepted` with `status: processing`, let the frontend poll `GET /documents/:id` or use a webhook/status endpoint._

### 6.2 Question → Retrieval → Answer (triggered by `POST /conversations/:id/messages`)

1. Embed the user's question (Gemini)
2. Run an Atlas Vector Search `$vectorSearch` aggregation against `chunks`, filtered to the conversation's `documentIds` (top 5–8 matches)
3. Build a prompt: system instructions + retrieved chunks (with page numbers) + question
4. Call Groq, **stream** tokens back to client as they arrive
5. Track which chunks were used → return as `citations: [{ page, chunkId }]` alongside the final message
6. Save both the user message and assistant message to `messages` collection

---

## 7. Auth Strategy

- No managed auth provider this time — auth is hand-built with `bcrypt` (password hashing) and `jsonwebtoken` (session tokens). This is actually a good thing to be able to explain in an interview: you understand what Supabase/Auth0 abstract away.
- Every protected route uses `auth.middleware.js` to verify the JWT from the `Authorization: Bearer <token>` header, decode the user id, and attach `req.user`.
- Every Mongo query in a protected route must explicitly filter by `req.user.id` — there's no database-level enforcement like Postgres RLS, so this discipline is entirely on the application code. Worth a callout in the README as a known tradeoff vs. the Supabase version.

---

## 8. Build Order (Postman-verified at every step)

1. **Health check** — `GET /health` returns `ok` ✅ done
2. **MongoDB connection** — confirm `config/db.js` (mongoose) connects ✅ done
3. **Auth** — signup/login working, JWT verified by middleware on a protected test route
4. **Upload endpoint** — PDF in, file stored in GridFS, text extracted, chunks in DB (no embeddings yet — verify chunking first)
5. **Embedding step** — add Gemini call to the pipeline, confirm vectors land in `chunks.embedding`
6. **Atlas Vector Search index** — create the index in Atlas UI, confirm a manual `$vectorSearch` query in Postman/Compass returns sensible chunks for a test question
7. **Full chat endpoint** — wire retrieval + Groq together, confirm streaming works in Postman (or a simple curl test)
8. **Document management endpoints** — list/rename/star/trash/restore/delete
9. **Only after all of the above pass in Postman** → connect the Lovable frontend

---

## 9. Differentiators to Build In (for resume value)

- **Source citations** — page-level references returned with every answer (already in schema/pipeline above)
- **Multi-document conversations** — `conversations.documentIds` is an array from day one
- **Streaming responses** — not a nice-to-have, build it from the start; retrofitting streaming later is painful
- **Clear README** documenting chunking strategy, why cosine similarity + Atlas Vector Search, context window handling, hand-rolled auth tradeoffs, and free-tier limits

---

## 10. Out of Scope (this document)

- Frontend UI (covered in separate Technical + Lovable PRDs)
- Real payment integration (billing endpoints are stubs for now)
- Rate limiting / abuse prevention (add before any public deployment)
- Google OAuth (custom JWT auth only for v1)
