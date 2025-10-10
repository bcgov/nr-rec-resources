import { Vector as VectorSource } from 'ol/source';
import type { Options as VectorSourceOptions } from 'ol/source/Vector';
import ClusterSource, { Options as ClusterOptions } from 'ol/source/Cluster';
import { EsriJSON } from 'ol/format';
import type { Feature } from 'ol';
import { Style } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import { capitalizeWords } from '@/utils/capitalizeWords';
import { featureLabelText } from '@/components/search-map/styles/feature';
import {
  createSITIcon,
  createRTRIcon,
  createIFIcon,
} from '@/components/search-map/styles/icons';
import { clusterStyle } from '@/components/search-map/styles/cluster';
import { RECREATION_FEATURE_LAYER } from '@/components/search-map/constants';

const iconStyleCache = new Map<string, Style>();
const labelTextCache = new Map<string, string>();
const labelStyleCache = new Map<string, Style>();

const RECREATION_FIELDS = [
  'PROJECT_NAME',
  'PROJECT_TYPE',
  'CLOSURE_IND',
  'FOREST_FILE_ID',
];

const getCapitalizedName = (name: string): string => {
  if (!labelTextCache.has(name)) {
    labelTextCache.set(name, capitalizeWords(name));
  }
  return labelTextCache.get(name)!;
};

const PROJECT_TYPE_ICON_MAP = {
  SIT: createSITIcon,
  RR: createSITIcon, // Recreation Reserves are displayed as Recreation Sites
  RTR: createRTRIcon,
  IF: createIFIcon,
} as const;

const getProjectTypeIcon = (
  projectType: string | undefined,
  options: { opacity: number; variant?: 'default' | 'closed' | 'selected' },
): Style => {
  if (projectType) {
    const iconType = Object.keys(PROJECT_TYPE_ICON_MAP).find((type) =>
      projectType.includes(type),
    );

    if (iconType) {
      return PROJECT_TYPE_ICON_MAP[
        iconType as keyof typeof PROJECT_TYPE_ICON_MAP
      ](options);
    }
  }

  return createSITIcon(options);
};

export function createClusteredRecreationFeatureStyle(
  feature: FeatureLike,
  resolution: number,
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

  // Handle cluster case
  if (features.length > 1) {
    return clusterStyle({
      size: features.length,
      clusterOpacity,
      haloOpacity,
    });
  }

  // Handle single feature case
  const singleFeature = features[0] ?? feature;
  const isSelected = singleFeature.get('selected');
  const isClosed = singleFeature.get('CLOSURE_IND') === 'Y';
  const projectType = singleFeature.get('PROJECT_TYPE');

  const useProjectTypeIcons = resolution <= 30000;

  // Determine icon variant based on feature state
  const variant = isSelected ? 'selected' : isClosed ? 'closed' : 'default';

  let iconStyle: Style;

  if (useProjectTypeIcons && projectType) {
    const iconKey = `icon-project-${projectType}-${variant}-${iconOpacity}`;

    if (!iconStyleCache.has(iconKey)) {
      const projectIcon = getProjectTypeIcon(projectType, {
        opacity: iconOpacity,
        variant,
      });
      iconStyleCache.set(iconKey, projectIcon);
    }

    iconStyle = iconStyleCache.get(iconKey)!;
  } else {
    const iconKey = `icon-default-${variant}-${iconOpacity}`;

    if (!iconStyleCache.has(iconKey)) {
      const defaultIconStyle = createSITIcon({
        opacity: iconOpacity,
        variant,
      });
      iconStyleCache.set(iconKey, defaultIconStyle);
    }

    iconStyle = iconStyleCache.get(iconKey)!;
  }

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

export const getFilteredFeatures = async (filteredIds: string[]) => {
  const format = new EsriJSON();
  const filteredSet = new Set(filteredIds);
  const batchSize = 1000;
  let offset = 0;
  let hasMore = true;
  const allFeatures: Feature[] = [];

  while (hasMore) {
    const params = new URLSearchParams({
      f: 'json',
      where: '1=1',
      outFields: RECREATION_FIELDS.join(','),
      resultRecordCount: String(batchSize),
      resultOffset: String(offset),
      orderByFields: 'PROJECT_NAME',
      inSR: '102100',
      outSR: '102100',
      returnGeometry: 'true',
      geometryPrecision: '7',
      outStatistics: '[]', // Request feature count for pagination
      returnCountOnly: 'false',
    });

    const response = await fetch(
      `${RECREATION_FEATURE_LAYER}/query/?${params}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const features = format.readFeatures(data, {
      featureProjection: 'EPSG:102100',
      dataProjection: 'EPSG:102100',
    }) as Feature[];

    // Process features in a batch
    const filteredFeatures = features.reduce<Feature[]>((acc, feature) => {
      const id = feature.get('FOREST_FILE_ID');
      if (filteredSet.has(String(id))) {
        feature.setId(String(id));
        feature.set('type', 'recreation-resource');
        acc.push(feature);
      }
      return acc;
    }, []);

    allFeatures.push(...filteredFeatures);

    // Update pagination
    if (data.features.length < batchSize) {
      hasMore = false;
    } else {
      offset += batchSize;
    }
  }

  return allFeatures;
};

/**
 * Creates a vector source with filtered features based on the provided IDs
 * @param filteredIds Array of feature IDs to include
 * @param projection The target projection for the features
 * @param options Additional loader options
 * @returns A clustered vector source containing only the filtered features
 */
export const createFilteredClusterSource = (
  filteredIds: string[],
  clusterOptions?: ClusterOptions,
) => {
  const source = new VectorSource({
    format: new EsriJSON(),
    overlaps: false,
  });

  source.setLoader(async () => {
    const features = await getFilteredFeatures(filteredIds);
    source.addFeatures(features);
  });

  // Create a clustered source from the filtered source
  return new ClusterSource({
    source,
    ...clusterOptions,
  });
};
