/**
 * 할 일 예정일이 오늘(로컬 자정 기준) 이전인지 — 날짜 없으면 false
 * @param {{ scheduled_date?: string, due_date?: string }} task
 */
export function isTaskOverdue(task) {
  const raw = task.scheduled_date || task.due_date;
  if (!raw) return false;
  const ymd = String(raw).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false;
  const due = new Date(`${ymd}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
