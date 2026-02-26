import { Prisma } from '@generated/prisma';

/**
 * Builds fuzzy search conditions for recreation resource queries
 * This centralizes the fuzzy search logic to avoid duplication
 */
export const buildFuzzySearchConditions = (searchText: string): Prisma.Sql => {
  if (!searchText?.trim()) {
    return Prisma.empty;
  }

  return Prisma.sql`(
    name ilike ${'%' + searchText + '%'}
    or closest_community ilike ${'%' + searchText + '%'}
    or similarity(name, ${searchText}) > 0.3
    or similarity(closest_community, ${searchText}) > 0.3
    or name % ${searchText}
    or closest_community % ${searchText}
    or (length(${searchText}) >= 4 and similarity(name, ${searchText}) > 0.2)
    or (length(${searchText}) >= 4 and similarity(closest_community, ${searchText}) > 0.2)
  )`;
};

/**
 * Builds fuzzy search scoring for ordering results by relevance
 */
export const buildFuzzySearchScore = (searchText: string): Prisma.Sql => {
  if (!searchText?.trim()) {
    return Prisma.empty;
  }

  return Prisma.sql`, GREATEST(
    similarity(name, ${searchText}),
    similarity(closest_community, ${searchText}),
    CASE WHEN name % ${searchText} THEN 0.8 ELSE 0 END,
    CASE WHEN closest_community % ${searchText} THEN 0.7 ELSE 0 END,
    CASE WHEN length(${searchText}) >= 4 AND similarity(name, ${searchText}) > 0.2 THEN similarity(name, ${searchText}) ELSE 0 END,
    CASE WHEN length(${searchText}) >= 4 AND similarity(closest_community, ${searchText}) > 0.2 THEN similarity(closest_community, ${searchText}) ELSE 0 END
  ) as fuzzy_score`;
};

/**
 * Builds ordering clause that prioritizes fuzzy matches
 */
export const buildFuzzySearchOrdering = (
  searchText: string,
  hasLocation: boolean = false,
): Prisma.Sql => {
  if (!searchText?.trim()) {
    return hasLocation
      ? Prisma.sql`order by distance asc, name asc`
      : Prisma.sql`order by name asc`;
  }

  return hasLocation
    ? Prisma.sql`order by distance asc, fuzzy_score desc, name asc`
    : Prisma.sql`order by fuzzy_score desc, name asc`;
};

/**
 * Builds ordering clause for suggestions (prioritizes exact matches over fuzzy)
 */
export const buildSuggestionsOrdering = (searchText: string): Prisma.Sql => {
  if (!searchText?.trim()) {
    return Prisma.sql`order by name asc`;
  }

  return Prisma.sql`
    order by
      CASE
        WHEN name ILIKE ${`${searchText}%`} THEN 0  -- exact prefix match in name
        WHEN name ILIKE ${`%${searchText}%`} THEN 1 -- partial match in name
        WHEN closest_community ILIKE ${`%${searchText}%`} THEN 2 -- match in community
        WHEN name % ${searchText} THEN 3  -- fuzzy match in name
        WHEN closest_community % ${searchText} THEN 4  -- fuzzy match in community
        ELSE 5
      END,
      fuzzy_score DESC,
      name ASC
  `;
};
