import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadProjects } from '@/shared/lib/loadProjects';

const ProjectsContext = createContext(null);

export function ProjectsProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await loadProjects();
    if (err) {
      setError(err.message || '프로젝트를 불러오지 못했습니다.');
      setProjects([]);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(
    () => ({ projects, loading, error, reload }),
    [projects, loading, error, reload]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error('useProjects는 ProjectsProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
