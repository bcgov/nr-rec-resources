import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Style, Icon } from 'ol/style';
import { FeatureLike } from 'ol/Feature';
import { WILDFIRE_LOCATION_LAYER } from '@/components/search-map/constants';
import WILDFIRE_ICON_OUT from '@shared/assets/icons/wildfire/out_of_control.svg';
import WILDFIRE_ICON_HELD from '@shared/assets/icons/wildfire/being_held.svg';
import WILDFIRE_ICON_UNDER from '@shared/assets/icons/wildfire/under_control.svg';

const FIRE_STATUS_ICONS: Record<string, string> = {
  'Out of Control': WILDFIRE_ICON_OUT,
  'Being Held': WILDFIRE_ICON_HELD,
  'Under Control': WILDFIRE_ICON_UNDER,
};

const WILDFIRE_FIELDS = [
  'IGNITION_DATE',
  'FIRE_STATUS',
  'CURRENT_SIZE',
  'OBJECTID',
  'FIRE_NUMBER',
  'GEOGRAPHIC_DESCRIPTION',
  'FIRE_URL',
];

export const createWildfireLocationStyle = (
  feature: FeatureLike,
  isHovered = false,
) => {
  const status = feature.get('FIRE_STATUS') || 'default';

  return new Style({
    image: new Icon({
      src: FIRE_STATUS_ICONS[status] || WILDFIRE_ICON_OUT,
      scale: isHovered ? 1.2 : 1,
      displacement: [0, 0],
      anchor: [0.5, 0.5],
    }),
  });
};

export const createWildfireLocationSource = () =>
  new VectorSource({
    format: new EsriJSON(),
    url: (extent) => {
      const geometry = extent.join(',');

      return (
        `${WILDFIRE_LOCATION_LAYER}/query/?` +
        `f=json` +
        `&where=${encodeURIComponent("FIRE_STATUS <> 'Out'")}` +
        `&outFields=${WILDFIRE_FIELDS.join(',')}` +
        `&geometry=${geometry}` +
        `&geometryType=esriGeometryEnvelope` +
        `&spatialRel=esriSpatialRelIntersects` +
        `&outSR=102100`
      );
    },
    strategy: bboxStrategy,
    wrapX: false,
  });

export const createWildfireLocationLayer = (source: VectorSource) => {
  const layer = new VectorLayer({
    source,
    style: (feature) => createWildfireLocationStyle(feature),
  });

  return layer;
};
