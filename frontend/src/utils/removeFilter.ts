const removeFilter = (
  id: string,
  param: string,
  searchParams: URLSearchParams,
) => {
  const updatedFilters = searchParams
    .get(param)
    ?.split('_')
    .filter((filter) => filter !== id)
    .join('_');
  return updatedFilters;
};

export default removeFilter;
