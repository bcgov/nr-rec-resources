const normalizePath = (path: string) => path.replace(/^\/+/, '');

export const buildActUrl = (
  baseUrl: string,
  path = '',
  query: Record<string, string> = {},
): string => {
  const normalizedPath = normalizePath(path);
  const queryString = new URLSearchParams(query).toString();

  if (!baseUrl) {
    const relativePath = normalizedPath ? `/${normalizedPath}` : '/';
    return queryString ? `${relativePath}?${queryString}` : relativePath;
  }

  const url = new URL(baseUrl);

  if (normalizedPath) {
    const basePath = url.pathname.replace(/\/$/, '');
    url.pathname = `${basePath}/${normalizedPath}`;
  }

  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

export const buildActLoginUrl = (baseUrl: string, path = ''): string =>
  buildActUrl(baseUrl, path, { idp: 'idir' });

export const buildActAdvisoryEditUrl = (
  baseUrl: string,
  advisoryNumber: number,
): string => buildActLoginUrl(baseUrl, `advisory-link/${advisoryNumber}`);
