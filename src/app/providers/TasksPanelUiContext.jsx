import { createContext, useContext, useMemo, useState } from 'react';

export const TASKS_PANEL_DEFAULT_SORT = { field: 'due_date', dir: 'asc' };

const TasksPanelUiContext = createContext(null);

export function TasksPanelUiProvider({ children }) {
  const [filterValues, setFilterValues] = useState({});
  const [sortValue, setSortValue] = useState(TASKS_PANEL_DEFAULT_SORT);
  const [overdueOnly, setOverdueOnly] = useState(false);

  const resetFilters = () => {
    setFilterValues({});
    setSortValue(TASKS_PANEL_DEFAULT_SORT);
    setOverdueOnly(false);
  };

  const value = useMemo(
    () => ({
      filterValues,
      setFilterValues,
      sortValue,
      setSortValue,
      overdueOnly,
      setOverdueOnly,
      resetFilters,
      defaultSort: TASKS_PANEL_DEFAULT_SORT,
    }),
    [filterValues, sortValue, overdueOnly]
  );

  return <TasksPanelUiContext.Provider value={value}>{children}</TasksPanelUiContext.Provider>;
}

export function useTasksPanelUi() {
  const ctx = useContext(TasksPanelUiContext);
  return ctx;
}
