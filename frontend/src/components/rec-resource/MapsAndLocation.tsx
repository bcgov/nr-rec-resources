import { forwardRef, useEffect, useState } from 'react';
import {
  Layer,
  Map,
  Marker,
  NavigationControl,
  Source,
  useMap,
} from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@/components/rec-resource/MapsAndLocation.scss';
import { constructMapboxStyleFromEsri } from 'esri-style-ft-mapbox-style';
const baseMapVectorUrl =
  'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer';

const arcgisFeatureServerUrl =
  'https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/hpai_dashboard/FeatureServer/0/query';

interface MapsAndLocationProps {
  location: [number, number];
}

const MapsAndLocation = forwardRef<HTMLElement, MapsAndLocationProps>(
  ({ location }, ref) => {
    const map = useMap();
    const [baseStyle, setBaseStyle] = useState(null);
    const [featureData, setFeatureData] = useState(null);

    useEffect(() => {
      const fetchMapStyle = async () => {
        const style = await constructMapboxStyleFromEsri(baseMapVectorUrl);
        setBaseStyle(style);
      };

      const fetchFeatureData = async () => {
        const response = await fetch(
          `${arcgisFeatureServerUrl}?f=geojson&where=1=1&outFields=*&outSR=4326`,
        );
        const data = await response.json();
        setFeatureData(data);
      };

      fetchMapStyle();
      fetchFeatureData();

      if (!map.current) return;
      // do stuff with map ref here, e.g. map.current.on('load', () => { ... });
      // there may be things we need to do with the vanilla library that isn't available with react
    }, [map]);

    if (!location) return null;
    const zoom = 12;

    return (
      <section id="maps-and-location" ref={ref}>
        <h2 className="section-heading">Maps and Location</h2>

        {baseStyle && (
          <Map
            initialViewState={{
              latitude: location[0],
              longitude: location[1],
              zoom,
            }}
            style={{ width: '100%', height: 400 }}
            mapStyle={baseStyle}
          >
            <NavigationControl position="top-right" />
            <Marker latitude={location[0]} longitude={location[1]} />
            {featureData && (
              <Source id="arcgis-features" type="geojson" data={featureData}>
                <Layer
                  id="arcgis-points"
                  type="circle"
                  paint={{
                    'circle-radius': 4,
                    'circle-color': '#ff0000',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                  }}
                />
              </Source>
            )}
          </Map>
        )}
      </section>
    );
  },
);

export default MapsAndLocation;
