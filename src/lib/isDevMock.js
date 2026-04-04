/**
 * 로컬 개발에서만 Supabase 대신 인메모리 목 데이터를 쓸지 여부.
 * 프로덕션 빌드에서는 항상 false.
 */
export function isDevMockEnabled() {
  if (!import.meta.env.DEV) return false;
  const raw =
    import.meta.env.USE_MOCK ?? import.meta.env.VITE_USE_MOCK ?? '';
  return String(raw).toLowerCase() === 'true' || raw === '1';
}
