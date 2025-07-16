# Backend Proxy for Gemini API

## Setup

1. Copy `.env.example` to `.env` and fill in your Gemini API key:
   ```sh
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   node server.js
   ```

## Debugging
- The server runs on `http://localhost:3001` by default.
- Test the endpoint with curl or Postman:
  ```sh
  curl -X POST http://localhost:3001/api/analyze -H 'Content-Type: application/json' -d '{"url": "https://example.com"}'
  ```
- Check the terminal for logs.

## Security
- Never commit your real `.env` file or API key to version control.
- Use environment variables for secrets. 