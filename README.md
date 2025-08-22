# Paris League – Netlify (Blobs fallback pronto)

## Cosa fare su Netlify
1. Importa questo repo da Git (**Add new site → Import from Git**).
2. In **Site settings → Environment variables** aggiungi:
   - `BLOBS_SITE_ID` = API ID del sito (Site settings → Site details → Site information)
   - `BLOBS_TOKEN` = Personal access token (User settings → Applications → Personal access tokens)
   - (opzionale) `NODE_VERSION` = `18`
3. Fai deploy (o **Clear cache and deploy**).

## Test rapido
Apri `/.netlify/functions/state`. Se vedi `{"players":[],"matches":[]}`, è ok.
