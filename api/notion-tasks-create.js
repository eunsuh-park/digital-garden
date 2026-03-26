/**
 * Vercel Serverless: Tasks DB 새 페이지 생성 (안전 필드만)
 * - Title (title) 필수
 * - Notes (rich_text)
 * - Task_Type, Difficulty (select)
 * - Estimated_Duration (rich_text)
 * - Scheduled_Date (date)
 * - Target_Plant (relation)
 * - Target_Location (relation)
 * - Status → 시작 전 (status)
 *
 * body: {
 *   title: string,
 *   notes?: string,
 *   task_type?: string,
 *   difficulty?: 'Easy'|'Medium'|'Hard',
 *   estimated_duration?: string,
 *   scheduled_date?: string, // YYYY-MM-DD
 *   target_plant_ids?: string[],
 *   target_location_ids?: string[],
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
  const databaseId = process.env.NOTION_DATABASE_ID_TASKS;
  if (!token || !databaseId) {
    return res.status(500).json({ error: 'Notion config missing' });
  }

  try {
    const body = req.body || {};
    const title = String(body.title ?? '').trim();
    if (!title) {
      return res.status(400).json({ error: 'Missing `title`' });
    }

    const notes = String(body.notes ?? '').trim();
    const taskType = String(body.task_type ?? 'Observation').trim() || 'Observation';
    const difficultyRaw = String(body.difficulty ?? 'Easy').trim();
    const difficulty = ['Easy', 'Medium', 'Hard'].includes(difficultyRaw) ? difficultyRaw : 'Easy';
    const estimatedDuration = String(body.estimated_duration ?? '').trim();
    const scheduledDate = String(body.scheduled_date ?? '').trim();
    const plantIds = Array.isArray(body.target_plant_ids) ? body.target_plant_ids : [];
    const relationPlantIds = plantIds.map((id) => String(id || '').trim()).filter(Boolean);
    const locationIds = Array.isArray(body.target_location_ids) ? body.target_location_ids : [];
    const relationLocationIds = locationIds.map((id) => String(id || '').trim()).filter(Boolean);

    const properties = {
      Title: {
        title: [
          {
            text: { content: title },
          },
        ],
      },
      Status: {
        status: { name: '시작 전' },
      },
      Task_Type: {
        select: { name: taskType },
      },
      Difficulty: {
        select: { name: difficulty },
      },
    };

    if (notes) {
      properties.Notes = {
        rich_text: [{ text: { content: notes } }],
      };
    } else {
      properties.Notes = { rich_text: [] };
    }

    if (estimatedDuration) {
      properties.Estimated_Duration = {
        rich_text: [{ text: { content: estimatedDuration } }],
      };
    } else {
      properties.Estimated_Duration = { rich_text: [] };
    }

    if (scheduledDate) {
      properties.Scheduled_Date = {
        date: { start: scheduledDate },
      };
    }

    if (relationPlantIds.length > 0) {
      properties.Target_Plant = {
        relation: relationPlantIds.map((id) => ({ id })),
      };
    }

    if (relationLocationIds.length > 0) {
      properties.Target_Location = {
        relation: relationLocationIds.map((id) => ({ id })),
      };
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
