import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import Cluster, { Options as ClusterOptions } from 'ol/source/Cluster';
import VectorSource, { Options as VectorSourceOptions } from 'ol/source/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style } from 'ol/style';
import type { StyleFunction } from 'ol/style/Style';
import Feature, { FeatureLike } from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { capitalizeWords } from '@/utils/capitalizeWords';
import { featureLabelText } from '@/components/search/SearchMap/styles/feature';
import {
  createLocationDotBlueIcon,
  createLocationDotRedIcon,
  createLocationDotOrangeIcon,
} from '@/components/search/SearchMap/styles/icons';
import { clusterStyle } from '@/components/search/SearchMap/styles/cluster';
import { RECREATION_FEATURE_LAYER } from '@/components/search/SearchMap/constants';
import { AnimatedClusterOptions } from '@/components/search/SearchMap/types';

const iconStyleCache = new Map<string, Style>();
const labelTextCache = new Map<string, string>();
const labelStyleCache = new Map<string, Style>();

const getCapitalizedName = (name: string): string => {
  if (!labelTextCache.has(name)) {
    labelTextCache.set(name, capitalizeWords(name));
  }
  return labelTextCache.get(name)!;
};

export function createClusteredRecreationFeatureStyle(
  feature: FeatureLike,
  _resolution: number,
  options?: {
    iconOpacity?: number;
    clusterOpacity?: number;
    haloOpacity?: number;
  },
): Style | Style[] | undefined {
  const {
    iconOpacity = 1,
    clusterOpacity = 0.85,
    haloOpacity = 0.7,
  } = options || {};

  const features = feature.get('features') ?? [feature];

  if (features.length > 1) {
    return clusterStyle({
      size: features.length,
      clusterOpacity,
      haloOpacity,
    });
  }

  const singleFeature = features[0] ?? feature;
  const isSelected = singleFeature.get('selected');

  if (isSelected) {
    return createLocationDotOrangeIcon({ opacity: iconOpacity });
  }

  const isClosed = singleFeature.get('CLOSURE_IND') === 'Y';
  const iconKey = `icon-${isClosed}-${iconOpacity}`;

  if (!iconStyleCache.has(iconKey)) {
    const iconStyle = isClosed
      ? createLocationDotRedIcon({ opacity: iconOpacity })
      : createLocationDotBlueIcon({ opacity: iconOpacity });
    iconStyleCache.set(iconKey, iconStyle);
  }

  const iconStyle = iconStyleCache.get(iconKey)!;

  const name = singleFeature.get('PROJECT_NAME');
  if (!name) return iconStyle;

  const label = getCapitalizedName(name);
  const labelKey = `label-${label}`;

  if (!labelStyleCache.has(labelKey)) {
    labelStyleCache.set(labelKey, new Style({ text: featureLabelText(label) }));
  }

  const labelStyle = labelStyleCache.get(labelKey)!;

  return [iconStyle, labelStyle];
}

export const createRecreationFeatureSource = (
  options?: VectorSourceOptions,
) => {
  const format = new EsriJSON();
  return new VectorSource({
    format,
    overlaps: false,
    ...options,
  });
};

export const recreationSource = createRecreationFeatureSource();

export const loadFeaturesForFilteredIds = async (
  filteredIds: string[],
  source: VectorSource,
  projection: any,
) => {
  source.clear();

  const batchSize = 1000;
  const filteredSet = new Set(filteredIds);
  const allFeatures: Feature<Geometry>[] = [];
  const format = new EsriJSON();

  let offset = 0;

  while (true) {
    const url =
      `${RECREATION_FEATURE_LAYER}/query/?f=json&where=1=1` +
      `&outFields=PROJECT_NAME,CLOSURE_IND,FOREST_FILE_ID` +
      `&resultRecordCount=${batchSize}&resultOffset=${offset}` +
      `&orderByFields=PROJECT_NAME` +
      `&inSR=102100` +
      `&outSR=102100`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      let features = format.readFeatures(data, {
        featureProjection: projection,
      });

      features = features.filter((feature) => {
        const id = feature.get('FOREST_FILE_ID');
        feature.setId(String(id));
        feature.set('type', 'recreation-resource');
        return filteredSet.has(String(id));
      });

      allFeatures.push(...features);

      if (data.features.length < batchSize) break;

      offset += batchSize;
    } catch (error) {
      console.error('Error fetching features:', error);
      break;
    }
  }

  source.addFeatures(allFeatures);
};

export const createClusteredRecreationFeatureSource = (
  options?: ClusterOptions,
) => {
  return new Cluster({
    source: recreationSource,
    ...options,
  });
};

export const createClusteredRecreationFeatureLayer = (
  source: Cluster,
  style: StyleFunction,
  options?: AnimatedClusterOptions,
) =>
  new AnimatedCluster({
    source,
    style,
    ...options,
  });
