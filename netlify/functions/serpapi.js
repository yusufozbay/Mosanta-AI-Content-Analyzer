const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const { q } = JSON.parse(event.body || '{}');
    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      return { statusCode: 500, body: 'SerpApi key is missing' };
    }
    // Helper to fetch a page
    async function fetchSerpPage(page) {
      const params = new URLSearchParams({
        engine: 'google',
        q,
        gl: 'tr',
        hl: 'tr',
        device: 'mobile',
        api_key: serpApiKey
      });
      if (page === 2) {
        params.set('start', '10');
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
    // Fetch first page
    const data1 = await fetchSerpPage(1);
    if (data1.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SerpApi error', details: data1.body })
      };
    }
    let organic = Array.isArray(data1.organic_results) ? data1.organic_results : [];
    // If less than 10, fetch second page and combine
    if (organic.length < 10) {
      const data2 = await fetchSerpPage(2);
      if (data2.error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'SerpApi error', details: data2.body })
        };
      }
      if (Array.isArray(data2.organic_results)) {
        organic = organic.concat(data2.organic_results);
      }
    }
    // Return only up to 20 results (max 2 pages)
    return {
      statusCode: 200,
      body: JSON.stringify({ organic_results: organic.slice(0, 20) })
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}; 