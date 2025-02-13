import { forwardRef, useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Feature, Map, View } from 'ol';
import {
  Vector as VectorSource,
  VectorTile as VectorTileSource,
} from 'ol/source';
import { Vector as VectorLayer, VectorTile as VectorTileLayer } from 'ol/layer';
import { Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { EsriJSON, MVT } from 'ol/format';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { applyStyle } from 'ol-mapbox-style';
import { Style, Icon } from 'ol/style';
import hikingIcon from '@/images/activities/hiking.svg';
import locationIcon from '@/images/fontAwesomeIcons/location-dot.svg';

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

const locationMarkerStyle = new Style({
  image: new Icon({
    src: locationIcon,
    scale: 0.08,
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

      applyStyle(baseLayer, baseMapVectorTileStyleUrl)
        .then(() => console.log('Esri basemap style applied successfully'))
        .catch((err) => console.error('Error applying Esri style:', err));

      const featureSource = new VectorSource({
        format: new EsriJSON(),
        url: (extent) =>
          `${arcgisFeatureServerUrl}?f=json&where=1=1&outFields=*&geometry=${extent.join(
            ',',
          )}&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&outSR=3857`,
        strategy: bboxStrategy, // Load features dynamically
      });

      const recResourceLocationFeature = new Feature({
        geometry: new Point(fromLonLat([location[1], location[0]])), // Convert to EPSG:3857
      });

      recResourceLocationFeature.setStyle(locationMarkerStyle);

      const recResourceLocationLayer = new VectorLayer({
        source: new VectorSource({
          features: [recResourceLocationFeature],
        }),
      });

      const featureLayer = new VectorLayer({
        source: featureSource,
        style: (feature) => {
          if (feature.getGeometry().getType() === 'Point') {
            return hikingIconStyle;
          }
        },
      });

      const map = new Map({
        target: mapRef.current,
        layers: [baseLayer, featureLayer, recResourceLocationLayer],
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
