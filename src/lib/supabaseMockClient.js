import { isDevMockEnabled } from './isDevMock';

const MOCK_USER = {
  id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  email: 'dev-mock@local.test',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

let mockSessionActive = true;

let mockProjects = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: '모의 텃밭 (USE_MOCK)',
    space_size: 'medium',
    space_description: '개발용 목 데이터입니다.',
    owner_id: MOCK_USER.id,
    created_at: '2024-06-01T12:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: '모의 온실',
    space_size: 'narrow',
    space_description: null,
    owner_id: MOCK_USER.id,
    created_at: '2024-05-01T08:30:00.000Z',
  },
];

const authListeners = new Set();

function notifyAuth(event, session) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch {
      /* noop */
    }
  });
}

function errUnknownTable(table) {
  return { data: null, error: { message: `[mock] 알 수 없는 테이블: ${table}` } };
}

function sortProjectsDesc(rows) {
  return [...rows].sort((a, b) =>
    String(b.created_at || '').localeCompare(String(a.created_at || ''))
  );
}

/**
 * Supabase 클라이언트와 동일한 `{ data, error }` 형태를 반환하는 개발용 목 클라이언트.
 */
export function createMockSupabaseClient() {
  if (!isDevMockEnabled()) {
    throw new Error('[mock] createMockSupabaseClient는 개발 + USE_MOCK에서만 사용할 수 있습니다.');
  }

  const auth = {
    async getUser() {
      return {
        data: { user: mockSessionActive ? MOCK_USER : null },
        error: null,
      };
    },
    async signInWithPassword(_creds) {
      mockSessionActive = true;
      const session = { user: MOCK_USER };
      notifyAuth('SIGNED_IN', session);
      return { data: { user: MOCK_USER, session }, error: null };
    },
    async signUp(_creds) {
      mockSessionActive = true;
      const session = { user: MOCK_USER };
      notifyAuth('SIGNED_IN', session);
      return { data: { user: MOCK_USER, session }, error: null };
    },
    async signOut() {
      mockSessionActive = false;
      notifyAuth('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange(callback) {
      authListeners.add(callback);
      queueMicrotask(() => {
        callback('INITIAL_SESSION', mockSessionActive ? { user: MOCK_USER } : null);
      });
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  };

  function from(table) {
    if (table !== 'projects') {
      return {
        select: () => ({
          order: () => Promise.resolve(errUnknownTable(table)),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve(errUnknownTable(table)),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve(errUnknownTable(table)),
            }),
          }),
        }),
        delete: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve(errUnknownTable(table)),
            }),
          }),
        }),
      };
    }

    return {
      select: (_cols) => ({
        order: (_col, _opts) =>
          Promise.resolve({ data: sortProjectsDesc(mockProjects), error: null }),
      }),
      insert: (rows) => {
        const rowIn = Array.isArray(rows) ? rows[0] : rows;
        return {
          select: (_cols) => ({
            single: async () => {
              const {
                data: { user },
              } = await auth.getUser();
              const id = crypto.randomUUID();
              const created_at = new Date().toISOString();
              const row = {
                ...rowIn,
                id,
                created_at,
                owner_id:
                  rowIn.owner_id != null
                    ? rowIn.owner_id
                    : user?.id != null
                      ? user.id
                      : null,
              };
              mockProjects = [row, ...mockProjects];
              return { data: row, error: null };
            },
          }),
        };
      },
      update: (updates) => ({
        eq: (col, id) => ({
          select: (_cols) => ({
            single: () => {
              if (col !== 'id') {
                return Promise.resolve({
                  data: null,
                  error: { message: '[mock] 지원: .eq("id", ...)' },
                });
              }
              const idx = mockProjects.findIndex((p) => p.id === id);
              if (idx === -1) {
                return Promise.resolve({
                  data: null,
                  error: { message: '프로젝트를 찾을 수 없습니다.' },
                });
              }
              const merged = { ...mockProjects[idx], ...updates };
              const next = mockProjects.slice();
              next[idx] = merged;
              mockProjects = next;
              return Promise.resolve({ data: merged, error: null });
            },
          }),
        }),
      }),
      delete: () => ({
        eq: (col, id) => ({
          select: (_cols) => ({
            single: () => {
              if (col !== 'id') {
                return Promise.resolve({
                  data: null,
                  error: { message: '[mock] 지원: .eq("id", ...)' },
                });
              }
              const idx = mockProjects.findIndex((p) => p.id === id);
              if (idx === -1) {
                return Promise.resolve({
                  data: null,
                  error: { message: '프로젝트를 찾을 수 없습니다.' },
                });
              }
              const next = mockProjects.slice();
              const [removed] = next.splice(idx, 1);
              mockProjects = next;
              return Promise.resolve({ data: removed, error: null });
            },
          }),
        }),
      }),
    };
  }

  return { auth, from };
}
