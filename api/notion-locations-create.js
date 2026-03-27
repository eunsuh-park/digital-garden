/**
 * Vercel Serverless: Locations DB 새 페이지 생성
 * - Name (title) 필수
 * - Description (rich_text)
 * - Color (select) — 기본 초록
 *
 * body: { name: string, description?: string, color?: string }
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
  const databaseId = process.env.NOTION_DATABASE_ID_SECTIONS;
  if (!token || !databaseId) {
    return res.status(500).json({ error: 'Notion config missing' });
  }

  try {
    const body = req.body || {};
    const name = String(body.name ?? '').trim();
    if (!name) return res.status(400).json({ error: 'Missing `name`' });

    const description = String(body.description ?? '').trim();
    const color = String(body.color ?? '초록').trim() || '초록';

    const properties = {
      Name: {
        title: [{ text: { content: name } }],
      },
      Color: {
        select: { name: color },
      },
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
