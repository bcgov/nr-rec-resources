/**
 * Calculates responsive padding for map view fitting, accounting for header overlay
 * @param mapWidth - The width of the map in pixels
 * @returns Padding array in format [top, right, bottom, left]
 */
export const calculateMapPadding = (
  mapWidth: number,
): [number, number, number, number] => {
  if (mapWidth >= 1200) {
    // Desktop
    return [140, 120, 120, 120];
  } else if (mapWidth >= 576) {
    // Tablet / small desktop
    return [140, 120, 120, 120];
  } else {
    // Mobile
    return [100, 80, 50, 80];
  }
};
