function parseTokens(value: string): string[] {
  return value
    .split('_')
    .map((token) => token.trim())
    .filter(Boolean);
}

export function transformStringArrayQueryParam({
  value,
}: {
  value: unknown;
}): string[] | undefined {
  if (typeof value === 'string') {
    return parseTokens(value);
  }

  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === 'string')
      .flatMap(parseTokens);
  }

  return undefined;
}
