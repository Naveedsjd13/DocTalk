# Testing Notes

## Running Tests

```bash
npm test
```

This runs Jest with `--runInBand` (sequential execution to avoid in-memory DB conflicts) and `--detectOpenHandles` (catches dangling connections).

## What is tested

- **Auth**: signup validation (weak password, duplicate email), login (correct/wrong credentials), token verification (`/me`), logout with real token revocation via the blocklist.
- **Documents**: PDF upload through the full pipeline (GridFS, parsing, chunking, mocked embedding), CRUD operations, starring/trash/restore, permanent deletion (verifies chunks are also deleted), file download, ownership isolation.
- **Chat**: conversation creation, message sending with SSE streaming (mocked LLM), message persistence with citations, conversation listing, ownership isolation.

## What is NOT tested

- **Google OAuth login** is intentionally excluded from automated tests. It requires a real browser redirect to Google's consent screen and was manually verified instead.
- **Gemini embedding and Groq LLM calls are mocked**, so these tests do not validate real embedding quality or LLM output correctness. They only verify that the pipeline wiring, auth, and data isolation work correctly.
- **Rate limiting** is relaxed in test mode (`NODE_ENV=test`) to avoid false failures. Production rate limits remain enforced.
