/**
 * Vercel Serverless: Locations DB 업데이트 (안전 필드만)
 * - Allowed updates:
 *   - Name (title)
 *   - Description (rich_text)
 *
 * request body: { id: string, name?: string, description?: string }
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
    const { id, name, description } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing `id`' });

    // 안전 필드만 payload에 포함
    const properties = {};

    if (name !== undefined) {
      properties.Name = {
        title: [
          {
            text: { content: String(name ?? '') },
          },
        ],
      };
    }

    if (description !== undefined) {
      const desc = String(description ?? '');
      properties.Description = desc.trim()
        ? {
            rich_text: [
              {
                text: { content: desc },
              },
            ],
          }
        : {
            rich_text: [],
          };
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

