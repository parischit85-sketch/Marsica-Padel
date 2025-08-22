// netlify/functions/state.js
// API semplice: GET/POST per leggere/scrivere lo stato dell'app
// Richiede Netlify Blobs attivati sul progetto (UI: Projects → Blobs).
// Nome dello store usato: "paris-league".

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // ottieni (o inizializza al primo uso) lo store "paris-league"
  const store = getStore('paris-league');
  const KEY = 'state.json'; // unico file JSON con { players, matches }

  // ===== READ =====
  if (event.httpMethod === 'GET') {
    const json = await store.get(KEY, { type: 'json' });
    // se non c'è ancora nulla, inizializza
    const initial = json ?? { players: [], matches: [] };
    if (!json) await store.setJSON(KEY, initial);
    return jsonRes(200, initial);
  }

  // ===== WRITE =====
  if (event.httpMethod === 'POST') {
    try {
      const data = JSON.parse(event.body || '{}');

      // Validazione minima
      if (!Array.isArray(data.players) || !Array.isArray(data.matches)) {
        return jsonRes(400, { error: 'payload non valido: servono players[] e matches[]' });
      }

      // Salva tutto lo stato in un colpo
      await store.setJSON(KEY, { players: data.players, matches: data.matches });
      return jsonRes(200, { ok: true });
    } catch (e) {
      return jsonRes(500, { error: 'JSON non valido', details: String(e) });
    }
  }

  // Metodo non supportato
  return jsonRes(405, { error: 'Method not allowed' });
};

// Helper risposta JSON
function jsonRes(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body),
  };
}
