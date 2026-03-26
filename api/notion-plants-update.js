/**
 * Vercel Serverless: Plants DB 업데이트
 * - Name, Species, Category, Status
 * - Bloom_Season, Notes, Quantity
 * - Location(relation)
 *
 * body: {
 *   id: string,
 *   name?: string,
 *   species?: string,
 *   category?: string,
 *   status?: string,
 *   bloom_season?: string,
 *   notes?: string,
 *   quantity?: number | string,
 *   location_ids?: string[],
 * }
 */
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID_PLANTS;
  if (!token || !databaseId) {
    return res.status(500).json({ error: 'Notion config missing' });
  }

  try {
    const body = req.body || {};
    const id = String(body.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Missing `id`' });

    const properties = {};

    if (body.name !== undefined) {
      const name = String(body.name ?? '');
      properties.Name = {
        title: [{ text: { content: name } }],
      };
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
        'Notion-Version': '2022-06-28',
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
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}

