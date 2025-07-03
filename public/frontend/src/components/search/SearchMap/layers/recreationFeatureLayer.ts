import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { Style } from 'ol/style';
import Feature, { FeatureLike } from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import { capitalizeWords } from '@/utils/capitalizeWords';
import {
  featureLabelText,
  locationDotBlueIcon,
  locationDotRedIcon,
} from '@/components/search/SearchMap/styles/feature';
import { clusterStyle } from '@/components/search/SearchMap/styles/cluster';
import { RECREATION_FEATURE_LAYER } from '@/components/search/SearchMap/constants';

//
// This file should be moved back to the shared map repo once map development has matured
// https://github.com/bcgov/prp-map/blob/main/src/layers/recreationFeatureLayer.ts

const iconStyleCache = new Map<string, Style>();
const labelTextCache = new Map<string, string>();
const labelStyleCache = new Map<string, Style>();

const getCapitalizedName = (name: string): string => {
  if (!labelTextCache.has(name)) {
    labelTextCache.set(name, capitalizeWords(name));
  }
  return labelTextCache.get(name)!;
};

export const createClusteredRecreationFeatureStyle = (
  _filteredIds: string[] = [],
) => {
  // const filteredSet = new Set(filteredIds);

  return (
    feature: FeatureLike,
    _resolution?: number,
  ): Style | Style[] | undefined => {
    const features = feature.get('features') ?? [feature];

    if (features.length > 1) {
      // If there are multiple features, render as a cluster
      return clusterStyle(features.length);
    }

    const singleFeature = features[0] ?? feature;

    // const id = singleFeature.get('FOREST_FILE_ID');
    // if (filteredSet.size && !filteredSet.has(id)) return;

    const isClosed = singleFeature.get('CLOSURE_IND') === 'Y';
    const iconKey = `icon-${isClosed}`;

    if (!iconStyleCache.has(iconKey)) {
      const icon = isClosed
        ? locationDotRedIcon.getImage()
        : locationDotBlueIcon.getImage();
      iconStyleCache.set(iconKey, new Style({ image: icon ?? undefined }));
    }

    const iconStyle = iconStyleCache.get(iconKey)!;

    const name = singleFeature.get('PROJECT_NAME');
    if (!name) return iconStyle;

    const label = getCapitalizedName(name);
    const labelKey = `label-${label}`;

    if (!labelStyleCache.has(labelKey)) {
      labelStyleCache.set(
        labelKey,
        new Style({ text: featureLabelText(label) }),
      );
    }

    const labelStyle = labelStyleCache.get(labelKey)!;

    return [iconStyle, labelStyle];
  };
};

export const createRecreationFeatureSource = (
  filteredIds: string[],
  options?: {
    tileSize?: number;
    wrapX?: boolean;
  },
) => {
  const format = new EsriJSON();
  const batchSize = 1000; // arcgis api has a limit of 1000 records per request
  const filteredSet = new Set(filteredIds);

  const source = new VectorSource({
    format,
    wrapX: options?.wrapX ?? false,
    overlaps: false,
  });

  source.setLoader(async (_extent, _resolution, projection) => {
    const allFeatures: Feature<Geometry>[] = [];

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

        features.forEach((feature) => {
          const id = feature.get('FOREST_FILE_ID');
          if (id) feature.setId(String(id));
        });

        features = features.filter((feature) =>
          filteredSet.has(String(feature.getId())),
        );

        allFeatures.push(...features);

        if (data.features.length < batchSize) {
          break;
        }

        offset += batchSize;
      } catch (error) {
        console.error('Error fetching features:', error);
        break;
      }
    }

    source.addFeatures(allFeatures);
  });

  return source;
};

export const createClusteredRecreationFeatureSource = (
  filteredIds: string[],
) => {
  return new Cluster({
    distance: 50,
    minDistance: 30,
    source: createRecreationFeatureSource(filteredIds),
  });
};

export const createClusteredRecreationFeatureLayer = (
  source: Cluster,
  style: ReturnType<typeof createClusteredRecreationFeatureStyle>,
  options?: {
    animationDuration?: number;
    declutter?: boolean;
    updateWhileInteracting?: boolean;
    updateWhileAnimating?: boolean;
    renderBuffer?: number;
  },
) =>
  new AnimatedCluster({
    source,
    animationDuration: options?.animationDuration ?? 500,
    style,
    declutter: options?.declutter ?? true,
    updateWhileAnimating: options?.updateWhileAnimating ?? true,
    updateWhileInteracting: options?.updateWhileInteracting ?? true,
    renderBuffer: options?.renderBuffer ?? 300,
  });
