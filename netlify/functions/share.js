const { v4: uuidv4 } = require('uuid');

// In-memory store (note: resets on cold start)
const store = {};

exports.handler = async function(event, context) {
  if (event.httpMethod === 'POST') {
    try {
      const { result } = JSON.parse(event.body);
      if (!result) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Missing result in request body' })
        };
      }
      const id = uuidv4();
      store[id] = result;
      const url = `${process.env.URL || 'https://mosanta-ai-content-analyzer.netlify.app'}/share/${id}`;
      return {
        statusCode: 200,
        body: JSON.stringify({ id, url })
      };
    } catch (err) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to store result', details: err.message })
      };
    }
  } else if (event.httpMethod === 'GET') {
    const id = event.queryStringParameters && event.queryStringParameters.id;
    if (!id || !store[id]) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Result not found' })
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ result: store[id] })
    };
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
}; 