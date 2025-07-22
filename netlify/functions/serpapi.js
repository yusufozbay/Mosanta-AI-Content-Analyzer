const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const { q } = JSON.parse(event.body || '{}');
    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      return { statusCode: 500, body: 'SerpApi key is missing' };
    }
    // Helper to fetch a page
    async function fetchSerpPage(start) {
      const params = new URLSearchParams({
        engine: 'google',
        q,
        gl: 'tr',
        hl: 'tr',
        device: 'mobile',
        api_key: serpApiKey
      });
      if (start > 0) {
        params.set('start', String(start));
      }
      const serpApiUrl = `https://serpapi.com/search.json?${params.toString()}`;
      const response = await fetch(serpApiUrl);
      const text = await response.text();
      if (!response.ok) {
        console.error('SerpApi error:', text);
        return { error: true, status: response.status, body: text };
      }
      return JSON.parse(text);
    }
    // Fetch pages until we have 10 unique competitors or no more results
    let organic = [];
    let seenUrls = new Set();
    let start = 0;
    let page = 1;
    while (organic.length < 10 && page <= 5) { // up to 5 pages max
      const data = await fetchSerpPage(start);
      if (data.error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'SerpApi error', details: data.body })
        };
      }
      const results = Array.isArray(data.organic_results) ? data.organic_results : [];
      for (const item of results) {
        if (item.link && !seenUrls.has(item.link)) {
          organic.push(item);
          seenUrls.add(item.link);
          if (organic.length === 10) break;
        }
      }
      if (results.length === 0) break; // no more results
      start += 10;
      page++;
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ organic_results: organic.slice(0, 10) })
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}; 