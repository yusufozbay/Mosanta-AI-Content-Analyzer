const { google } = require('googleapis');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { date, tokenCount } = JSON.parse(event.body || '{}');
    if (!date || typeof tokenCount !== 'number') {
      return { statusCode: 400, body: 'Missing date or tokenCount' };
    }
    // Load credentials from env (base64-encoded JSON)
    const credsB64 = process.env.GOOGLE_SHEETS_CREDENTIALS;
    if (!credsB64) {
      return { statusCode: 500, body: 'Missing Google Sheets credentials' };
    }
    const creds = JSON.parse(Buffer.from(credsB64, 'base64').toString('utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });
    const spreadsheetId = '1e1uzBrhhzCwmMEuxbiNofOI0iglXBfKPgmUU6O3Azl0';
    const range = 'Sheet1!A:B'; // Date in A, Token_Count in B
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[date, tokenCount]]
      }
    });
    return { statusCode: 200, body: 'Logged successfully' };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}; 