// netlify/functions/state.js
// Usa Neon come storage JSON per players + matches

import { neon } from '@netlify/neon';

const sql = neon(); // usa automaticamente NETLIFY_DATABASE_URL

async function ensureInit() {
  await sql`
    CREATE TABLE IF NOT EXISTS app_state (
      id int PRIMARY KEY,
      data jsonb NOT NULL
    )
  `;
  const res = await sql`SELECT 1 FROM app_state WHERE id=1`;
  if (res.length === 0) {
    await sql`INSERT INTO app_state (id, data) VALUES (1, ${JSON.stringify({ players: [], matches: [] })}::jsonb)`;
  }
}

export async function handler(event) {
  try {
    await ensureInit();

    if (event.httpMethod === 'GET') {
      const rows = await sql`SELECT data FROM app_state WHERE id=1`;
      return jsonRes(200, rows[0].data);
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      if (!Array.isArray(body.players) || !Array.isArray(body.matches)) {
        return jsonRes(400, { error: 'payload non valido: servono players[] e matches[]' });
      }
      await sql`UPDATE app_state SET data=${JSON.stringify(body)}::jsonb WHERE id=1`;
      return jsonRes(200, { ok: true });
    }

    return jsonRes(405, { error: 'Method not allowed' });
  } catch (err) {
    return jsonRes(500, { error: String(err) });
  }
}

function jsonRes(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
