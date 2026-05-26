import EsriJSON from 'ol/format/EsriJSON';
import type { Feature } from 'ol';

interface FetchOptions {
  url: string;
  layer: '3' | '5';
  ids: string[];
}

const format = new EsriJSON();
/**
 * Fetch BCGW features for a layer filtered to the provided
 * FOREST_FILE_ID list. Returns parsed OL features ready to add to a
 * VectorSource. The id list is sent in a POST body so requests are not
 * constrained by URL length.
 */
export async function fetchBcgwFeaturesByIds({
  url,
  layer,
  ids,
}: FetchOptions): Promise<Feature[]> {
  const response = await fetch(`${url}?layer=${layer}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) {
    throw new Error(`BCGW proxy responded with status ${response.status}`);
  }
  const data = await response.json();
  return format.readFeatures(data, {
    featureProjection: 'EPSG:3857',
    dataProjection: 'EPSG:3857',
  }) as Feature[];
}
