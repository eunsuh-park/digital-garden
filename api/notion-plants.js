/**
 * Vercel Serverless: Plants DB — 조회(GET) + 변경(POST, body.action)
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
  const databaseId = process.env.NOTION_DATABASE_ID_PLANTS;

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

      const species = String(body.species ?? '').trim();
      const category = String(body.category ?? '').trim();
      const status = String(body.status ?? 'planted').trim() || 'planted';
      const bloomSeason = String(body.bloom_season ?? '').trim();
      const notes = String(body.notes ?? '').trim();
      const quantityRaw = body.quantity;
      const quantity = quantityRaw === '' || quantityRaw == null ? null : Number(quantityRaw);
      const locationIds = Array.isArray(body.location_ids) ? body.location_ids : [];
      const relLocationIds = locationIds.map((id) => String(id || '').trim()).filter(Boolean);

      const properties = {
        Name: { title: [{ text: { content: name } }] },
        Status: { select: { name: status } },
      };

      if (species) properties.Species = { select: { name: species } };
      if (category) properties.Category = { select: { name: category } };
      if (bloomSeason) {
        properties.Bloom_Season = { rich_text: [{ text: { content: bloomSeason } }] };
      } else {
        properties.Bloom_Season = { rich_text: [] };
      }
      if (notes) {
        properties.Notes = { rich_text: [{ text: { content: notes } }] };
      } else {
        properties.Notes = { rich_text: [] };
      }
      if (Number.isFinite(quantity)) {
        properties.Quantity = { number: quantity };
      }
      if (relLocationIds.length > 0) {
        properties.Location = { relation: relLocationIds.map((id) => ({ id })) };
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
      const id = String(body.id || '').trim();
      if (!id) return res.status(400).json({ error: 'Missing `id`' });

      const properties = {};

      if (body.name !== undefined) {
        const name = String(body.name ?? '');
        properties.Name = { title: [{ text: { content: name } }] };
      }
      if (body.species !== undefined) {
        const species = String(body.species ?? '').trim();
        properties.Species = species ? { select: { name: species } } : undefined;
      }
      if (body.category !== undefined) {
        const category = String(body.category ?? '').trim();
        properties.Category = category ? { select: { name: category } } : undefined;
      }
      if (body.status !== undefined) {
        const status = String(body.status ?? '').trim();
        properties.Status = status ? { select: { name: status } } : undefined;
      }
      if (body.bloom_season !== undefined) {
        const bloom = String(body.bloom_season ?? '');
        properties.Bloom_Season = bloom.trim()
          ? { rich_text: [{ text: { content: bloom } }] }
          : { rich_text: [] };
      }
      if (body.notes !== undefined) {
        const notes = String(body.notes ?? '');
        properties.Notes = notes.trim()
          ? { rich_text: [{ text: { content: notes } }] }
          : { rich_text: [] };
      }
      if (body.quantity !== undefined) {
        if (body.quantity === '' || body.quantity == null) {
          properties.Quantity = { number: null };
        } else {
          const q = Number(body.quantity);
          if (Number.isFinite(q)) properties.Quantity = { number: q };
        }
      }
      if (body.location_ids !== undefined && Array.isArray(body.location_ids)) {
        const relIds = body.location_ids.map((x) => String(x || '').trim()).filter(Boolean);
        properties.Location = { relation: relIds.map((rid) => ({ id: rid })) };
      }

      for (const k of Object.keys(properties)) {
        if (properties[k] === undefined) delete properties[k];
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
