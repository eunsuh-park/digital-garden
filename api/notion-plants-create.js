/**
 * Vercel Serverless: Plants DB 새 페이지 생성
 * - Name (title) 필수
 * - Species, Category, Status (select)
 * - Bloom_Season, Notes (rich_text)
 * - Quantity (number)
 * - Location (relation)
 *
 * body: {
 *   name: string,
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
    const name = String(body.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'Missing `name`' });

    const species = String(body.species ?? '').trim();
    const category = String(body.category ?? '').trim();
    const status = String(body.status ?? 'planted').trim() || 'planted';
    const bloomSeason = String(body.bloom_season ?? '').trim();
    const notes = String(body.notes ?? '').trim();
    const quantityRaw = body.quantity;
    const quantity =
      quantityRaw === '' || quantityRaw == null ? null : Number(quantityRaw);
    const locationIds = Array.isArray(body.location_ids) ? body.location_ids : [];
    const relLocationIds = locationIds.map((id) => String(id || '').trim()).filter(Boolean);

    const properties = {
      Name: {
        title: [{ text: { content: name } }],
      },
      Status: {
        select: { name: status },
      },
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
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || 'Notion create failed',
        code: data.code,
      });
    }

    return res.status(200).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}

