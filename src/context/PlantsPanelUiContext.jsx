import { createContext, useContext, useMemo, useState } from 'react';

export const PLANTS_PANEL_DEFAULT_SORT = { field: 'name', dir: 'asc' };

const PlantsPanelUiContext = createContext(null);

export function PlantsPanelUiProvider({ children }) {
  const [filterValues, setFilterValues] = useState({});
  const [sortValue, setSortValue] = useState(PLANTS_PANEL_DEFAULT_SORT);

  const resetFilters = () => {
    setFilterValues({});
    setSortValue(PLANTS_PANEL_DEFAULT_SORT);
  };

  const value = useMemo(
    () => ({
      filterValues,
      setFilterValues,
      sortValue,
      setSortValue,
      resetFilters,
      defaultSort: PLANTS_PANEL_DEFAULT_SORT,
    }),
    [filterValues, sortValue]
  );

  return <PlantsPanelUiContext.Provider value={value}>{children}</PlantsPanelUiContext.Provider>;
}

export function usePlantsPanelUi() {
  return useContext(PlantsPanelUiContext);
}
