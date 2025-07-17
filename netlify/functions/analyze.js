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
    // Try to fetch the page directly to get the H1
    let h1Text = '';
    try {
      const directRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (directRes.ok) {
        const html = await directRes.text();
        const dom = new JSDOM(html);
        const h1 = dom.window.document.querySelector('h1');
        h1Text = h1 ? h1.textContent.trim() : '';
      }
    } catch (err) {
      // Ignore direct fetch error, fallback to SerpAPI
    }
    if (!h1Text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to extract H1 from the target URL. Cannot proceed with SerpAPI.' })
      };
    }
    // Use SerpAPI to search for the page using the H1 as the query
    const serpApiKey = process.env.SERPAPI_KEY;
    const serpApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(h1Text)}&api_key=${serpApiKey}`;
    const serpRes = await fetch(serpApiUrl);
    if (!serpRes.ok) {
      const errorText = await serpRes.text();
      console.error('SerpAPI error:', errorText);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to fetch from SerpAPI', details: errorText })
      };
    }
    const serpData = await serpRes.json();
    // Try to find the matching result
    let pageHtml = '';
    if (serpData.organic_results && Array.isArray(serpData.organic_results)) {
      const match = serpData.organic_results.find(r => r.link && r.link.includes(url));
      if (match && match.link) {
        // Try to fetch the HTML of the matched result
        try {
          const pageRes = await fetch(match.link, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          if (pageRes.ok) {
            pageHtml = await pageRes.text();
          }
        } catch (err) {
          // Ignore
        }
      }
    }
    if (!pageHtml) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to fetch page HTML via SerpAPI search.' })
      };
    }
    // Extract <body> content
    const dom = new JSDOM(pageHtml);
    const bodyText = dom.window.document.body.textContent || '';
    if (!bodyText.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No <body> content found' })
      };
    }
    // Prepare response (can be extended for title, etc.)
    return {
      statusCode: 200,
      body: JSON.stringify({
        title: h1Text,
        content: bodyText,
        url
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request', details: err.message })
    };
  }
}; 