const toSearchValues = (value: unknown): string[] => {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(toSearchValues);
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return [String(value)];
  }

  return [JSON.stringify(value)];
};

export const stringifyRouterSearch = (
  search: Record<string, unknown>,
): string => {
  const params = new URLSearchParams();

  Object.entries(search).forEach(([key, value]) => {
    toSearchValues(value).forEach((entry) => params.append(key, entry));
  });

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const parseRouterSearch = (
  searchString: string,
): Record<string, unknown> => {
  const params = new URLSearchParams(
    searchString.startsWith('?') ? searchString.slice(1) : searchString,
  );

  return Array.from(new Set(params.keys())).reduce<Record<string, unknown>>(
    (search, key) => {
      const values = params.getAll(key);
      search[key] = values.length === 1 ? values[0] : values;
      return search;
    },
    {},
  );
};
