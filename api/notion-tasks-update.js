/**
 * Vercel Serverless: Tasks DB 업데이트
 * - Allowed updates:
 *   - Title (title)
 *   - Notes (rich_text)
 *   - Task_Type (select)
 *   - Difficulty (select)
 *   - Estimated_Duration (rich_text)
 *   - Scheduled_Date (date)
 *   - Target_Plant (relation)
 *   - Target_Location (relation)
 *   - Status (status)
 *
 * request body: {
 *   id: string,
 *   title?: string,
 *   notes?: string,
 *   task_type?: string,
 *   difficulty?: 'Easy'|'Medium'|'Hard',
 *   estimated_duration?: string,
 *   scheduled_date?: string, // YYYY-MM-DD
 *   target_plant_ids?: string[],
 *   target_location_ids?: string[],
 *   status_name?: string, // Notion Status name
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
  const databaseId = process.env.NOTION_DATABASE_ID_TASKS; // validate env
  if (!token || !databaseId) {
    return res.status(500).json({ error: 'Notion config missing' });
  }

  try {
    const { id, title, notes, task_type, difficulty, estimated_duration, scheduled_date, target_plant_ids, target_location_ids, status_name } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing `id`' });

    const properties = {};

    if (title !== undefined) {
      const v = String(title ?? '');
      properties.Title = {
        title: [
          {
            text: { content: v },
          },
        ],
      };
    }

    if (notes !== undefined) {
      const v = String(notes ?? '');
      properties.Notes = v.trim()
        ? {
            rich_text: [{ text: { content: v } }],
          }
        : { rich_text: [] };
    }

    if (task_type !== undefined) {
      const v = String(task_type ?? '').trim();
      properties.Task_Type = v
        ? {
            select: { name: v },
          }
        : undefined;
    }

    if (difficulty !== undefined) {
      const v = String(difficulty ?? '').trim();
      properties.Difficulty = v
        ? {
            select: { name: v },
          }
        : undefined;
    }

    if (estimated_duration !== undefined) {
      const v = String(estimated_duration ?? '');
      properties.Estimated_Duration = v.trim()
        ? { rich_text: [{ text: { content: v } }] }
        : { rich_text: [] };
    }

    if (scheduled_date !== undefined) {
      const v = String(scheduled_date ?? '').trim();
      properties.Scheduled_Date = v
        ? { date: { start: v } }
        : { date: null };
    }

    const plantIds = Array.isArray(target_plant_ids) ? target_plant_ids : [];
    if (plantIds.length) {
      const relIds = plantIds.map((x) => String(x || '').trim()).filter(Boolean);
      properties.Target_Plant = {
        relation: relIds.map((pid) => ({ id: pid })),
      };
    } else if (target_plant_ids && Array.isArray(target_plant_ids)) {
      // payload가 명시적으로 빈 배열이면 관계 제거
      properties.Target_Plant = { relation: [] };
    }

    const locationIds = Array.isArray(target_location_ids) ? target_location_ids : [];
    if (locationIds.length) {
      const relIds = locationIds.map((x) => String(x || '').trim()).filter(Boolean);
      properties.Target_Location = {
        relation: relIds.map((lid) => ({ id: lid })),
      };
    } else if (target_location_ids && Array.isArray(target_location_ids)) {
      properties.Target_Location = { relation: [] };
    }

    if (status_name !== undefined) {
      const v = String(status_name ?? '').trim();
      properties.Status = v
        ? {
            status: { name: v },
          }
        : undefined;
    }

    // undefined 속성 제거
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

