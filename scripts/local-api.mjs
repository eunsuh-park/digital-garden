import http from 'node:http';
import { URL } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.LOCAL_API_PORT || 8787);
const NOTION_VERSION = '2022-06-28';

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function json(res, status, body) {
  setCors(res);
  res.statusCode = status;
  res.end(JSON.stringify(body));
}

async function queryNotionDatabase(databaseId) {
  const token = process.env.NOTION_API_KEY;
  if (!token || !databaseId) {
    const missing = [
      !token ? 'NOTION_API_KEY' : null,
      !databaseId ? 'NOTION_DATABASE_ID_*' : null,
    ].filter(Boolean);
    throw new Error(`Notion config missing: ${missing.join(', ')}`);
  }

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data?.message || data?.error || 'Notion API error';
    const err = new Error(msg);
    err.status = response.status;
    err.code = data?.code;
    throw err;
  }

  return data;
}

const routes = {
  '/api/notion-locations': () => queryNotionDatabase(process.env.NOTION_DATABASE_ID_SECTIONS),
  '/api/notion-sections': () => queryNotionDatabase(process.env.NOTION_DATABASE_ID_SECTIONS),
  '/api/notion-tasks': () => queryNotionDatabase(process.env.NOTION_DATABASE_ID_TASKS),
  '/api/notion-plants': () => queryNotionDatabase(process.env.NOTION_DATABASE_ID_PLANTS),
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const handler = routes[url.pathname];

    if (req.method === 'OPTIONS') {
      setCors(res);
      res.statusCode = 204;
      return res.end();
    }

    if (req.method !== 'GET') {
      return json(res, 405, { error: 'Method not allowed' });
    }

    if (!handler) {
      return json(res, 404, { error: 'Not found' });
    }

    const data = await handler();
    return json(res, 200, data);
  } catch (e) {
    const status = Number(e.status) || 500;
    return json(res, status, { error: e.message || 'Server error', code: e.code });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[local-api] listening on http://localhost:${PORT}`);
});

