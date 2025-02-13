import { forwardRef, useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Feature, Map, View } from 'ol';
import {
  Vector as VectorSource,
  VectorTile as VectorTileSource,
} from 'ol/source';
import { Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { EsriJSON, MVT } from 'ol/format';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { applyStyle } from 'ol-mapbox-style';
import { Style, Icon } from 'ol/style';
import Point from 'ol/geom/Point';
import hikingIcon from '@/images/activities/hiking.svg';
import locationIcon from '@/images/icons/blue-status.svg'; // location-dot wasn't working for some reason

interface MapsAndLocationProps {
  location: [number, number];
}

const hikingIconStyle = new Style({
  image: new Icon({
    src: hikingIcon,
    scale: 0.1,
    anchor: [0.5, 1],
  }),
});

const locationMarkerStyle = new Style({
  image: new Icon({
    src: locationIcon,
    scale: 1,
    anchor: [0.5, 1],
  }),
});

const baseMapVectorTileBaseUrl =
  'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer';

const baseMapVectorTileUrl = `${baseMapVectorTileBaseUrl}/tile/{z}/{y}/{x}`;

const baseMapVectorTileStyleUrl = `${baseMapVectorTileBaseUrl}/resources/styles/root.json`;

const arcgisFeatureServerUrl =
  'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/hpai_dashboard/FeatureServer/0/query';

const MapsAndLocation = forwardRef<HTMLElement, MapsAndLocationProps>(
  ({ location }, ref) => {
    const mapRef = useRef(null);

    useEffect(() => {
      if (!mapRef.current) return;

      const baseLayer = new VectorTileLayer({
        source: new VectorTileSource({
          url: baseMapVectorTileUrl,
          format: new MVT(),
        }),
      });

      applyStyle(baseLayer, baseMapVectorTileStyleUrl);

      const locationLayer = new VectorLayer({
        source: new VectorSource({
          features: [
            new Feature({
              geometry: new Point([location[1], location[0]]),
            }),
          ],
        }),
        style: locationMarkerStyle,
      });

      const featureSource = new VectorSource({
        format: new EsriJSON(),
        url: (extent) =>
          `${arcgisFeatureServerUrl}?f=json&where=1=1&outFields=*&geometry=${extent.join(
            ',',
          )}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outSR=3857`,
        strategy: bboxStrategy,
      });

      const featureLayer = new VectorLayer({
        source: featureSource,
        style: (feature) => {
          const geometry = feature.getGeometry();
          if (geometry?.getType() === 'Point') {
            return hikingIconStyle;
          }
        },
      });

      const map = new Map({
        target: mapRef.current,
        layers: [baseLayer, featureLayer, locationLayer],
        view: new View({
          center: [location[1], location[0]],
          zoom: 14,
          minZoom: 5,
          projection: 'EPSG:3857',
        }),
      });

      return () => map.setTarget(undefined);
    }, [location]);

    if (!location) return null;

    return (
      <section id="maps-and-location" ref={ref}>
        <h2 className="section-heading">Maps and Location</h2>
        <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
      </section>
    );
  },
);

export default MapsAndLocation;
