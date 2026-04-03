/**
 * Vercel Serverless: Notion Locations DB(앱에서는 Zone/구역) — 조회(GET) + 변경(POST, body.action)
 * action: create | update | delete
 */
const NOTION_VERSION = '2022-06-28';

function setCors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  const token = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID_SECTIONS;

  if (req.method === 'OPTIONS') {
    setCors(res, 'GET, POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    setCors(res, 'GET, POST, OPTIONS');
    if (!token || !databaseId) {
      return res.status(500).json({ error: 'Notion config missing' });
    }
    try {
      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 100 }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          error: err.message || 'Notion API error',
          code: err.code,
        });
      }
      const data = await response.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message || 'Server error' });
    }
  }

  if (req.method !== 'POST') {
    setCors(res, 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCors(res, 'GET, POST, OPTIONS');
  if (!token || !databaseId) {
    return res.status(500).json({ error: 'Notion config missing' });
  }

  const body = req.body || {};
  const action = String(body.action || '').trim().toLowerCase();

  try {
    if (action === 'create') {
      const name = String(body.name ?? '').trim();
      if (!name) return res.status(400).json({ error: 'Missing `name`' });

      const description = String(body.description ?? '').trim();
      const color = String(body.color ?? '초록').trim() || '초록';

      const properties = {
        Name: { title: [{ text: { content: name } }] },
        Color: { select: { name: color } },
      };
      if (description) {
        properties.Description = { rich_text: [{ text: { content: description } }] };
      } else {
        properties.Description = { rich_text: [] };
      }

      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || 'Notion create failed',
          code: data.code,
        });
      }
      return res.status(200).json({ ok: true, id: data.id });
    }

    if (action === 'update') {
      const { id, name, description } = body;
      if (!id) return res.status(400).json({ error: 'Missing `id`' });

      const properties = {};
      if (name !== undefined) {
        properties.Name = { title: [{ text: { content: String(name ?? '') } }] };
      }
      if (description !== undefined) {
        const desc = String(description ?? '');
        properties.Description = desc.trim()
          ? { rich_text: [{ text: { content: desc } }] }
          : { rich_text: [] };
      }

      const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || 'Notion update failed',
          code: data.code,
        });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Missing `id`' });

      const response = await fetch(`https://api.notion.com/v1/pages/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ archived: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || 'Notion delete failed',
          code: data.code,
        });
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Missing or invalid `action` (create|update|delete)' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
