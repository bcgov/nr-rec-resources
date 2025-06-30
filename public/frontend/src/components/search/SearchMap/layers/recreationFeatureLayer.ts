import AnimatedCluster from 'ol-ext/layer/AnimatedCluster';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
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

    const singleFeature = features?.[0] ?? feature;
    // const id = singleFeature.get('FOREST_FILE_ID');
    // if (filteredSet.size && !filteredSet.has(id)) return;

    const isClosed = singleFeature.get('CLOSURE_IND') === 'Y';
    const iconKey = `icon-${isClosed}`;
    let iconStyle = iconStyleCache.get(iconKey);

    if (!iconStyle) {
      const icon = isClosed
        ? locationDotRedIcon.getImage()
        : locationDotBlueIcon.getImage();
      iconStyle = new Style({ image: icon ?? undefined });
      iconStyleCache.set(iconKey, iconStyle);
    }

    const name = singleFeature.get('PROJECT_NAME');
    let labelStyle;

    if (name) {
      const label = getCapitalizedName(name);
      const labelKey = `label-${label}`;
      labelStyle = labelStyleCache.get(labelKey);

      if (!labelStyle) {
        labelStyle = new Style({ text: featureLabelText(label) });
        labelStyleCache.set(labelKey, labelStyle);
      }
    }

    return labelStyle ? [iconStyle, labelStyle] : iconStyle;
  };
};

export const createRecreationFeatureSource = (options?: {
  tileSize?: number;
  wrapX?: boolean;
}) => {
  const format = new EsriJSON();

  const source = new VectorSource({
    format,
    strategy: bboxStrategy,
    wrapX: options?.wrapX ?? false,
    overlaps: false,
  });

  source.setLoader((extent, _resolution, projection) => {
    const geometry = extent.join(',');
    const url =
      `${RECREATION_FEATURE_LAYER}/query/?` +
      `f=json` +
      `&where=1=1` +
      `&outFields=PROJECT_NAME,CLOSURE_IND,FOREST_FILE_ID,OBJECTID` +
      `&geometry=${geometry}` +
      `&geometryType=esriGeometryEnvelope` +
      `&spatialRel=esriSpatialRelIntersects` +
      `&outSR=102100`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const features = format.readFeatures(data, {
          featureProjection: projection,
        });

        for (const feature of features) {
          const id = feature.get('FOREST_FILE_ID');
          if (id) feature.setId(id);
        }

        return source.addFeatures(features);
      })
      .catch((error) => {
        console.error('Error loading recreation features:', error);
      });
  });

  return source;
};
export const createClusteredRecreationFeatureSource = () => {
  return new Cluster({
    distance: 50,
    minDistance: 30,
    source: createRecreationFeatureSource(),
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
