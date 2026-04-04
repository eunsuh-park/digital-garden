import { createContext, useContext, useMemo, useState } from 'react';

const ProjectNewMapBuilderUiContext = createContext(undefined);

export function ProjectNewMapBuilderUiProvider({ children }) {
  const [mapBuilderOpen, setMapBuilderOpen] = useState(false);
  const value = useMemo(() => ({ mapBuilderOpen, setMapBuilderOpen }), [mapBuilderOpen]);
  return (
    <ProjectNewMapBuilderUiContext.Provider value={value}>{children}</ProjectNewMapBuilderUiContext.Provider>
  );
}

/** 새 프로젝트 2단계 맵 빌더에서 우측 패널 전환 등에 사용. Provider 밖에서는 no-op. */
export function useProjectNewMapBuilderUi() {
  const ctx = useContext(ProjectNewMapBuilderUiContext);
  return ctx ?? { mapBuilderOpen: false, setMapBuilderOpen: () => {} };
}
