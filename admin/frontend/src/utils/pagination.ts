export type PageItem = number | 'ellipsis';

export const buildPageRange = (start: number, end: number) =>
  Array.from(
    { length: Math.max(end - start + 1, 0) },
    (_, index) => start + index,
  );

export const buildPageItems = (
  pageIndex: number,
  pageCount: number,
): PageItem[] => {
  if (pageCount <= 7) {
    return buildPageRange(0, pageCount - 1);
  }

  let middlePages = buildPageRange(pageIndex - 1, pageIndex + 1);

  if (pageIndex <= 2) {
    middlePages = buildPageRange(1, 3);
  } else if (pageIndex >= pageCount - 3) {
    middlePages = buildPageRange(pageCount - 4, pageCount - 2);
  }

  return [0, ...middlePages, pageCount - 1].reduce<PageItem[]>(
    (items, currentIndex) => {
      const previousIndex = items.at(-1);

      if (
        typeof previousIndex === 'number' &&
        currentIndex - previousIndex > 1
      ) {
        items.push('ellipsis');
      }

      items.push(currentIndex);
      return items;
    },
    [],
  );
};
