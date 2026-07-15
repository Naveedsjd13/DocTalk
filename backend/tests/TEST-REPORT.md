# DocTalk Backend — Test Report

## Summary

| Metric      | Value                 |
| ----------- | --------------------- |
| Test Suites | 3 passed              |
| Total Tests | 33 passed             |
| Runtime     | ~9.5s                 |
| Framework   | Jest + Supertest      |
| Database    | mongodb-memory-server |

## Test Suites

| Suite               | Tests | Coverage                                                                       |
| ------------------- | ----- | ------------------------------------------------------------------------------ |
| `auth.test.js`      | 11    | Signup, login, JWT, logout, token revocation                                   |
| `documents.test.js` | 16    | Upload, CRUD, star, trash, restore, permanent delete, file download, ownership |
| `chat.test.js`      | 6     | Conversation CRUD, SSE message streaming, ownership                            |

## What Was Set Up

- **Jest** configured with `jest.config.js` (node environment, 20s timeout)
- **MongoDB Memory Server** for isolated test DB per run (single connection shared across suites)
- **Mocked external services**: embedding (768-dim fake vector), LLM (async generator), retrieval (fake chunks), pdf-parse (returns fixed text)
- **Rate limiters** relaxed in test mode (max: 10000)
- **`server.js`** refactored: `app` exported separately, `start()` only runs when executed directly, conversation routes mounted

## Bugs Fixed During Testing

| Bug                                                                                                   | Fix                                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `pdf-parse` throws "Command token too long" / "bad XRef entry" inside Jest's VM                       | Mocked `pdf-parse` in test files                                                              |
| `googleId: { unique: true, sparse: true }` causes duplicate key error on null values in memory server | Replaced with partial index: `{ partialFilterExpression: { googleId: { $type: "string" } } }` |
| `gridfs.js` stale bucket reference between test files                                                 | Made `connect()` idempotent (single shared connection)                                        |
| Conversation routes missing from `server.js`                                                          | Added `app.use("/api/conversations", conversationRoutes)`                                     |
| `setupFilesAfterSetup` invalid jest config option                                                     | Changed to `setupFiles`                                                                       |

## Files Created

- `jest.config.js`
- `tests/setup.js`
- `tests/fixtures/sample.pdf`
- `tests/mocks/embedding.mock.js`
- `tests/mocks/llm.mock.js`
- `tests/mocks/retrieval.mock.js`
- `tests/mocks/pdf-parse.mock.js`
- `tests/auth.test.js`
- `tests/documents.test.js`
- `tests/chat.test.js`

## How to Run

```bash
npm test
```
