const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  try {
    const { url } = JSON.parse(event.body);
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing url in request body' })
      };
    }
    // Fetch HTML
    const htmlResponse = await fetch(url);
    if (!htmlResponse.ok) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to fetch URL' })
      };
    }
    const html = await htmlResponse.text();
    // Extract <body> text
    const dom = new JSDOM(html);
    const bodyText = dom.window.document.body.textContent || '';
    if (!bodyText.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No <body> content found' })
      };
    }
    // Prepare Gemini payload
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
    const geminiRes = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify(geminiPayload),
      }
    );
    const data = await geminiRes.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request', details: err.message })
    };
  }
}; 