const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGINS || '*' }));
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing url in request body' });
  }
  try {
    // Fetch the HTML content from the URL
    const htmlResponse = await fetch(url);
    if (!htmlResponse.ok) {
      return res.status(400).json({ error: 'Failed to fetch URL' });
    }
    const html = await htmlResponse.text();
    // Extract <body> content
    const dom = new JSDOM(html);
    const bodyText = dom.window.document.body.textContent || '';
    if (!bodyText.trim()) {
      return res.status(400).json({ error: 'No <body> content found' });
    }
    // Prepare Gemini API payload
    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: bodyText }
          ]
        }
      ]
    };
    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify(geminiPayload),
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process request', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)); 