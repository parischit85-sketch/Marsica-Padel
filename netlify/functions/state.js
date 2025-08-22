// netlify/functions/state.js
// CommonJS + fallback a BLOBS_SITE_ID/BLOBS_TOKEN
const { getStore, BlobsClient } = require('@netlify/blobs');

function getBlobStore() {
  try {
    // Se Blobs è disponibile nativamente nel runtime Netlify
    return getStore('paris-league');
  } catch {
    // Fallback manuale con SITE_ID + TOKEN
    const siteID = process.env.BLOBS_SITE_ID;
    const token = process.env.BLOBS_TOKEN;
    if (!siteID || !token) {
      throw new Error(
        'MissingBlobsConfig: set BLOBS_SITE_ID and BLOBS_TOKEN in Environment variables'
      );
    }
    const client = new BlobsClient({ siteID, token });
    return client.store('paris-league');
  }
}

exports.handler = async (event) => {
  const store = getBlobStore();
  const KEY = 'state.json';

  if (event.httpMethod === 'GET') {
    const json = await store.get(KEY, { type: 'json' });
    const initial = json ?? { players: [], matches: [] };
    if (!json) await store.setJSON(KEY, initial);
    return jsonRes(200, initial);
  }

  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');
      if (!Array.isArray(data.players) || !Array.isArray(data.matches)) {
        return jsonRes(400, { error: 'payload non valido' });
      }
      await store.setJSON(KEY, { players: data.players, matches: data.matches });
      return jsonRes(200, { ok: true });
    } catch (e) {
      return jsonRes(500, { error: 'json non valido', details: String(e) });
    }
  }

  return jsonRes(405, { error: 'Method not allowed' });
};

function jsonRes(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body),
  };
}

