import * as React from 'react';
import { useEffect, useState } from 'react';
import OlMap from 'ol/Map';
import OlView from 'ol/View';
import MapComponent from '@terrestris/react-geo/dist/Map/MapComponent/MapComponent';
import MapContext from '@terrestris/react-util/dist/Context/MapContext/MapContext';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { GeoJSON, MVT } from 'ol/format';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { get as getProjection, transform, transformExtent } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { extend, getCenter } from 'ol/extent';
import { RecreationResourceDto } from '@/service/recreation-resource';
import { ZoomButton, ZoomToExtentButton } from '@terrestris/react-geo';
import './TrailMap.scss';
import {
  faLocationCrosshairs,
  faMinus,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Coordinate } from 'ol/coordinate';
import { applyStyle } from 'ol-mapbox-style';
import { useGetMapStyles } from '@/service/queries/map-service';

// Define and register EPSG:3005 projection
proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_0=45 +lon_0=-126 +lat_1=50 +lat_2=58.5 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
register(proj4);

const proj3005 = getProjection('EPSG:3005') ?? 'EPSG:3857';

interface TrailMapProps {
  recResource?: RecreationResourceDto | undefined;
  style?: React.CSSProperties;
}

const vectorTileLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    url: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/tile/{z}/{x}/{y}.pbf', // Updated URL
  }),
});

export const TrailMap = ({ recResource, style }: TrailMapProps) => {
  const [map, setMap] = useState<OlMap>();
  const [center, setCenter] = useState<Coordinate>();
  const [zoomExtent, setZoomExtent] = useState<Coordinate>();

  const { data: glStyles } = useGetMapStyles();

  useEffect(() => {
    applyStyle(vectorTileLayer, glStyles, 'esri');
  }, [glStyles]);

  // Apply the basemap style
  useEffect(() => {
    setMap(
      new OlMap({
        controls: [],
        view: new OlView({
          center: transform([1758871.897, 514456.792], proj3005, 'EPSG:3857'),
          constrainResolution: true,
          zoom: 15,
          enableRotation: false,
          extent: transformedExtent,
          maxZoom: 30,
        }),
        layers: [vectorTileLayer],
      }),
    );
  }, []);

  const extent = [-155.230138, 36.180153, -102.977437, 66.591323];
  const transformedExtent = transformExtent(extent, 'EPSG:4326', 'EPSG:3857');

  useEffect(() => {
    if (!recResource?.geometry || !map) return;

    const geojsonFormat = new GeoJSON({
      dataProjection: proj3005,
      featureProjection: 'EPSG:3857',
    });

    // Initialize vector layer for all features
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const geometry = feature.getGeometry();
        const type = geometry?.getType();

        return new Style({
          stroke: new Stroke({ color: '#42814A', width: 3, lineDash: [6, 6] }),
          fill:
            type !== 'LineString'
              ? new Fill({ color: 'rgba(255, 0, 0, 0.2)' })
              : undefined,
          text: new Text({
            text: recResource.name, // Replace with your label property
            placement: type === 'LineString' ? 'line' : 'point',
            fill: new Fill({ color: 'black' }),
            stroke: new Stroke({ color: 'white', width: 2 }),
            textBaseline: type === 'Polygon' ? 'middle' : 'bottom',
            textAlign: 'center',
          }),
        });
      },
    });

    let combinedExtent: number[] = [];

    // Process each geometry and add features to the same vector source
    recResource.geometry.forEach((geom) => {
      const features = geojsonFormat.readFeatures(geom);

      if (features.length === 0) return;

      // Update combined extent
      const geometryExtent = features[0]?.getGeometry()?.getExtent();
      if (!geometryExtent) return;

      combinedExtent =
        combinedExtent.length === 0
          ? geometryExtent
          : extend(combinedExtent, geometryExtent);

      // Add features to vector source
      vectorSource.addFeatures(features);
    });

    // Add single vector layer to map
    map.addLayer(vectorLayer);

    // Update map view if we have valid extent
    if (combinedExtent.length > 0) {
      const center = getCenter(combinedExtent);
      map.getView().setCenter(center);
      map.getView().fit(combinedExtent, {
        padding: [50, 50, 50, 50], // Add padding around extent
        duration: 1000, // Animate transition
      });
      setCenter(center);
      setZoomExtent(combinedExtent);
    }

    // Cleanup function
    return () => {
      map.removeLayer(vectorLayer);
    };
  }, [recResource, map]);

  if (!map) return null;

  return (
    <MapContext.Provider value={map}>
      <MapComponent map={map} style={style}>
        <div className="map-btn zoom-control">
          <ZoomToExtentButton
            center={center}
            zoom={map.getView().getZoom()}
            extent={zoomExtent}
          >
            <FontAwesomeIcon icon={faLocationCrosshairs} />
          </ZoomToExtentButton>
          <ZoomButton className="zoom-in-btn">
            <FontAwesomeIcon icon={faPlus} />
          </ZoomButton>
          <ZoomButton delta={-1} className="zoom-out-btn">
            <FontAwesomeIcon icon={faMinus} />
          </ZoomButton>
        </div>
      </MapComponent>
    </MapContext.Provider>
  );
};
