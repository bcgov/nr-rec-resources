import { useMemo } from 'react';
import { transform, transformExtent } from 'ol/proj';
import {
  MAP_PROJECTION_BC_ALBERS,
  MAP_PROJECTION_WEB_MERCATOR,
  MAP_PROJECTION_WGS84,
} from '@/components/rec-resource/TrailMap/utils/projections';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import BaseLayer from 'ol/layer/Base';

export const useMapInitialization = (layers: BaseLayer[]) => {
  return useMemo(() => {
    const extent = [-155.230138, 36.180153, -102.977437, 66.591323];
    const transformedExtent = transformExtent(
      extent,
      MAP_PROJECTION_WGS84,
      MAP_PROJECTION_WEB_MERCATOR,
    );

    return new OlMap({
      controls: [],
      view: new OlView({
        center: transform(
          [1758871.897, 514456.792],
          MAP_PROJECTION_BC_ALBERS,
          MAP_PROJECTION_WEB_MERCATOR,
        ),
        constrainResolution: true,
        zoom: 15,
        enableRotation: false,
        extent: transformedExtent,
        maxZoom: 30,
      }),
      layers: layers,
    });
  }, [layers]);
};
