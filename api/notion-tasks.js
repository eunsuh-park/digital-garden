/**
 * Vercel Serverless: Tasks DB — 조회(GET) + 변경(POST, body.action)
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
  const databaseId = process.env.NOTION_DATABASE_ID_TASKS;

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
      const title = String(body.title ?? '').trim();
      if (!title) return res.status(400).json({ error: 'Missing `title`' });

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
        Title: { title: [{ text: { content: title } }] },
        Status: { status: { name: '시작 전' } },
        Task_Type: { select: { name: taskType } },
        Difficulty: { select: { name: difficulty } },
      };

      if (notes) {
        properties.Notes = { rich_text: [{ text: { content: notes } }] };
      } else {
        properties.Notes = { rich_text: [] };
      }

      if (estimatedDuration) {
        properties.Estimated_Duration = { rich_text: [{ text: { content: estimatedDuration } }] };
      } else {
        properties.Estimated_Duration = { rich_text: [] };
      }

      if (scheduledDate) {
        properties.Scheduled_Date = { date: { start: scheduledDate } };
      }

      if (relationPlantIds.length > 0) {
        properties.Target_Plant = { relation: relationPlantIds.map((id) => ({ id })) };
      }

      if (relationLocationIds.length > 0) {
        properties.Target_Location = { relation: relationLocationIds.map((id) => ({ id })) };
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
      const {
        id,
        title,
        notes,
        task_type,
        difficulty,
        estimated_duration,
        scheduled_date,
        target_plant_ids,
        target_location_ids,
        status_name,
      } = body;
      if (!id) return res.status(400).json({ error: 'Missing `id`' });

      const properties = {};

      if (title !== undefined) {
        properties.Title = { title: [{ text: { content: String(title ?? '') } }] };
      }
      if (notes !== undefined) {
        const v = String(notes ?? '');
        properties.Notes = v.trim() ? { rich_text: [{ text: { content: v } }] } : { rich_text: [] };
      }
      if (task_type !== undefined) {
        const v = String(task_type ?? '').trim();
        properties.Task_Type = v ? { select: { name: v } } : undefined;
      }
      if (difficulty !== undefined) {
        const v = String(difficulty ?? '').trim();
        properties.Difficulty = v ? { select: { name: v } } : undefined;
      }
      if (estimated_duration !== undefined) {
        const v = String(estimated_duration ?? '');
        properties.Estimated_Duration = v.trim()
          ? { rich_text: [{ text: { content: v } }] }
          : { rich_text: [] };
      }
      if (scheduled_date !== undefined) {
        const v = String(scheduled_date ?? '').trim();
        properties.Scheduled_Date = v ? { date: { start: v } } : { date: null };
      }

      const plantIds = Array.isArray(target_plant_ids) ? target_plant_ids : [];
      if (plantIds.length) {
        const relIds = plantIds.map((x) => String(x || '').trim()).filter(Boolean);
        properties.Target_Plant = { relation: relIds.map((pid) => ({ id: pid })) };
      } else if (target_plant_ids && Array.isArray(target_plant_ids)) {
        properties.Target_Plant = { relation: [] };
      }

      const locIds = Array.isArray(target_location_ids) ? target_location_ids : [];
      if (locIds.length) {
        const relIds = locIds.map((x) => String(x || '').trim()).filter(Boolean);
        properties.Target_Location = { relation: relIds.map((lid) => ({ id: lid })) };
      } else if (target_location_ids && Array.isArray(target_location_ids)) {
        properties.Target_Location = { relation: [] };
      }

      if (status_name !== undefined) {
        const v = String(status_name ?? '').trim();
        properties.Status = v ? { status: { name: v } } : undefined;
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
