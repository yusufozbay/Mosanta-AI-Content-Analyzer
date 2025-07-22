const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const { q } = JSON.parse(event.body || '{}');
    const serpApiKey = process.env.SERPAPI_KEY;
    if (!serpApiKey) {
      return { statusCode: 500, body: 'SerpApi key is missing' };
    }
    const params = new URLSearchParams({
      engine: 'google',
      q,
      gl: 'tr',
      hl: 'tr',
      device: 'mobile',
      api_key: serpApiKey
    });
    const serpApiUrl = `https://serpapi.com/search.json?${params.toString()}`;
    const response = await fetch(serpApiUrl);
    const data = await response.text();
    return {
      statusCode: response.ok ? 200 : 500,
      body: data
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}; 