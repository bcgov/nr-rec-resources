import { forwardRef, useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorTileLayer from 'ol/layer/VectorTile';
import { VectorTile as VectorTileSource } from 'ol/source';
import MVT from 'ol/format/MVT';
import { applyStyle } from 'ol-mapbox-style';

interface MapsAndLocationProps {
  location: [number, number];
}

const esriVectorTileUrl =
  'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/tile/{z}/{y}/{x}';

const MapsAndLocation = forwardRef<HTMLElement, MapsAndLocationProps>(
  ({ location }, ref) => {
    const mapRef = useRef(null);

    useEffect(() => {
      if (!mapRef.current) return;

      const baseLayer = new VectorTileLayer({
        source: new VectorTileSource({
          url: esriVectorTileUrl, // Set the ESRI vector tile URL here
          format: new MVT(),
        }),
      });

      const map = new Map({
        target: mapRef.current,
        layers: [baseLayer],
        view: new View({
          center: [location[1], location[0]],
          zoom: 12,
          projection: 'EPSG:3857',
        }),
      });

      applyStyle(
        baseLayer,
        'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/resources/styles/root.json?f=json',
      );

      return () => map.setTarget(null); // Cleanup on unmount
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
