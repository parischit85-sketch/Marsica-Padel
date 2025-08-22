// netlify/functions/state.js
// Gestione stato via Netlify Blobs (nativo o manuale con SITE_ID+TOKEN)
// Richiede le env: BLOBS_SITE_ID, BLOBS_TOKEN (per fallback manuale)

const blobs = require('@netlify/blobs');
const getStoreMaybe = () => {
  try {
    if (typeof blobs.getStore === 'function') {
      return blobs.getStore('paris-league'); // tenterà Blobs nativo
    }
  } catch (e) {
    // prosegui con fallback
  }

  // Fallback manuale
  const siteID = process.env.BLOBS_SITE_ID;
  const token  = process.env.BLOBS_TOKEN;
  if (!siteID || !token) {
    throw new Error(
      'MissingBlobsConfig: set BLOBS_SITE_ID and BLOBS_TOKEN in Environment variables'
    );
  }

  // 1) createClient se disponibile (v6+)
  if (typeof blobs.createClient === 'function') {
    const client = blobs.createClient({ siteID, token });
    return client.store('paris-league');
  }

  // 2) BlobsClient come fallback alternativo (alcuni ambienti)
  if (typeof blobs.BlobsClient === 'function') {
    const client = new blobs.BlobsClient({ siteID, token });
    return client.store('paris-league');
  }

  // 3) Se proprio non c'è nulla, segnala chiaramente
  throw new Error(
    'Netlify Blobs client non disponibile: né getStore né createClient/BlobsClient. ' +
    'Controlla la versione di @netlify/blobs (dependencies) e riesegui il deploy senza cache.'
  );
};

exports.handler = async (event) => {
  const store = getStoreMaybe();
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
        return jsonRes(400, { error: 'payload non valido: servono players[] e matches[]' });
      }
      await store.setJSON(KEY, { players: data.players, matches: data.matches });
      return jsonRes(200, { ok: true });
    } catch (e) {
      return jsonRes(500, { error: 'JSON non valido', details: String(e) });
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
