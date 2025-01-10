// Function to build a query string from an object of key-value pairs
// eg: buildQueryString({ page: "1", search: "search" }) => "?page=1&search=search"

const buildQueryString = (params: {
  [key: string]: string | number | undefined | null;
}) => {
  if (!params) return '';
  const query = Object.entries(params)

    .filter(([_, value]) => value !== '' && value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return query ? `?${query}` : '';
};

export default buildQueryString;
