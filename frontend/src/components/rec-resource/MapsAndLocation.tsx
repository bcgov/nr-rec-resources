import { forwardRef, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorTileLayer from 'ol/layer/VectorTile';
import { VectorTile as VectorTileSource } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import EsriJSON from 'ol/format/EsriJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import MVT from 'ol/format/MVT';
import { applyStyle } from 'ol-mapbox-style';
import Style from 'ol/style/Style';
import hikingIcon from '@/images/activities/hiking.svg';
import Icon from 'ol/style/Icon';
interface MapsAndLocationProps {
  location: [number, number];
}

// 🔹 Style function to apply SVG icon to points
const hikingIconStyle = new Style({
  image: new Icon({
    src: hikingIcon,
    scale: 0.1, // Adjust size if necessary
    anchor: [0.5, 1], // Center the icon properly
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

      // 🔹 ESRI Vector Tile Layer (Basemap)
      const baseLayer = new VectorTileLayer({
        source: new VectorTileSource({
          url: baseMapVectorTileUrl,
          format: new MVT(),
        }),
      });

      // 🔹 Apply Mapbox Style to Esri Basemap (ASYNC)
      applyStyle(baseLayer, baseMapVectorTileStyleUrl)
        .then(() => console.log('Esri basemap style applied successfully'))
        .catch((err) => console.error('Error applying Esri style:', err));

      // 🔹 ArcGIS Feature Server Layer (Dynamic Data)
      const featureSource = new VectorSource({
        format: new EsriJSON(),
        url: (extent) =>
          `${arcgisFeatureServerUrl}?f=json&where=1=1&outFields=*&geometry=${extent.join(
            ',',
          )}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outSR=3857`,
        strategy: bboxStrategy, // Load features dynamically
      });

      const featureLayer = new VectorLayer({
        source: featureSource,
        style: (feature) => {
          if (feature.getGeometry().getType() === 'Point') {
            return hikingIconStyle;
          }
        },
      });

      const point = new VectorLayer({
        source: new VectorSource({
          features: [
            new Feature({
              geometry: new Point(fromLonLat(location)),
            }),
          ],
        }),
      });

      const map = new Map({
        target: mapRef.current,
        layers: [baseLayer, featureLayer, point],
        view: new View({
          center: [location[1], location[0]],
          zoom: 14,
          projection: 'EPSG:3857',
        }),
      });

      return () => map.setTarget(null);
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
