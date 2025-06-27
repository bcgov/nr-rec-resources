import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { containsExtent } from 'ol/extent';
import OLMap from 'ol/Map';
import type { Extent } from 'ol/extent';
import { Style } from 'ol/style';
import { RECREATION_FEATURE_LAYER } from '@/components/search/SearchMap/constants';
import { FeatureLike } from 'ol/Feature';
import { capitalizeWords } from '@/utils/capitalizeWords';
import {
  featureLabelText,
  locationDotBlueIcon,
  locationDotRedIcon,
} from '@/components/search/SearchMap/mapStyles';

const loadedExtents: Extent[] = [];

//
// This file should be moved back to the shared map repo once map development has matured
// https://github.com/bcgov/prp-map/blob/main/src/layers/recreationFeatureLayer.ts

const iconStyleCache = new Map<string, Style>();
const labelTextCache = new Map<string, string>();
const labelStyleCache = new Map<string, Style>();

export const getCapitalizedName = (name: string): string => {
  if (!labelTextCache.has(name)) {
    labelTextCache.set(name, capitalizeWords(name));
  }
  return labelTextCache.get(name)!;
};

export const createRecreationIconStyle = (filteredIds: string[] = []) => {
  const filteredSet = new Set(filteredIds);

  return (feature: FeatureLike): Style | undefined => {
    const id = feature.get('FOREST_FILE_ID');
    if (filteredSet.size === 0 || !filteredSet.has(id)) return undefined;

    const isClosed = feature.get('CLOSURE_IND') === 'Y';
    const key = `icon-${isClosed}`;

    if (!iconStyleCache.has(key)) {
      const icon = isClosed
        ? locationDotRedIcon.getImage()
        : locationDotBlueIcon.getImage();
      iconStyleCache.set(key, new Style({ image: icon ?? undefined }));
    }

    return iconStyleCache.get(key);
  };
};

export const createRecreationLabelStyle = (filteredIds: string[] = []) => {
  const filteredSet = new Set(filteredIds);

  return (feature: FeatureLike): Style | undefined => {
    const id = feature.get('FOREST_FILE_ID');

    if (filteredSet.size === 0 || !filteredSet.has(id)) return undefined;

    const name = feature.get('PROJECT_NAME');
    if (!name) return;

    const label = getCapitalizedName(name);
    const key = `label-${label}`;

    if (!labelStyleCache.has(key)) {
      labelStyleCache.set(key, new Style({ text: featureLabelText(label) }));
    }

    return labelStyleCache.get(key);
  };
};

export const createRecreationFeatureSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    wrapX: false,
  });

export const fetchRecreationFeatures = (source: VectorSource, map: OLMap) => {
  const extent = map.getView().calculateExtent(map.getSize());

  if (loadedExtents.some((e) => containsExtent(e, extent))) return;
  loadedExtents.push(extent);

  const geometry = extent.join(',');
  const url =
    `${RECREATION_FEATURE_LAYER}/query/?` +
    `f=json` +
    `&where=1=1` +
    `&outFields=PROJECT_NAME,CLOSURE_IND,FOREST_FILE_ID` +
    `&geometry=${geometry}` +
    `&geometryType=esriGeometryEnvelope` +
    `&spatialRel=esriSpatialRelIntersects` +
    `&outSR=102100`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
      return res.json();
    })
    .then((data) => {
      const format = new EsriJSON();
      const features = format.readFeatures(data, {
        dataProjection: 'EPSG:102100',
        featureProjection: map.getView().getProjection(),
      });
      return source.addFeatures(features);
    })
    .catch((err) => console.error('Feature load error', err));
};

export const createRecreationFeatureLayer = (
  source: VectorSource,
  style: (
    feature: FeatureLike,
    resolution?: number,
  ) => Style | Style[] | undefined,
  options?: {
    declutter?: boolean | string;
    maxTextResolution: number;
    updateWhileInteracting?: boolean;
    updateWhileAnimating?: boolean;
    renderBuffer?: number;
  },
) =>
  new VectorLayer({
    source,
    style,
    declutter: options?.declutter ?? true,
    updateWhileInteracting: options?.updateWhileInteracting ?? true,
    updateWhileAnimating: options?.updateWhileAnimating ?? true,
    renderBuffer: options?.renderBuffer ?? 300,
  });
