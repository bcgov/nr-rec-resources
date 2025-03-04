import React, { useEffect, useRef } from 'react';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { transform, transformExtent } from 'ol/proj';
import { LineString } from 'ol/geom';
import { Fill, Stroke, Style } from 'ol/style';
import { Feature, Map } from 'ol';

// Import proj4 and register function
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import VectorTileLayer from '~/ol/layer/VectorTile';
import { VectorTile } from '~/ol/source';
import CircleStyle from '~/ol/style/Circle';
import { MVT } from '~/ol/format';
import { applyStyle } from '~/ol-mapbox-style';
import { rawData } from '@/components/rec-resource/TrailMap/rawData';

export const TrailMap = () => {
  const mapRef = useRef<HTMLDivElement>(undefined);
  const olMap = useRef<Map>(null);

  useEffect(() => {
    // Define and register EPSG:3005 projection
    proj4.defs(
      'EPSG:3005',
      '+proj=aea +lat_0=45 +lon_0=-126 +lat_1=50 +lat_2=58.5 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
    );
    register(proj4);

    const image = new CircleStyle({
      radius: 5,
      stroke: new Stroke({ color: 'red', width: 1 }),
    });

    const styles = {
      Point: new Style({
        image: image,
      }),
      LineString: new Style({
        stroke: new Stroke({
          color: 'green',
          width: 1,
        }),
      }),
      Polygon: new Style({
        stroke: new Stroke({
          color: 'rgb(255, 90, 0)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 217, 105, 0.4)',
        }),
      }),
      MultiPolygon: new Style({
        stroke: new Stroke({
          color: 'rgb(255, 90, 0)',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 217, 105, 0.4)',
        }),
      }),
    };

    const styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };

    const tileLayer = new VectorTileLayer({
      // Use VectorTileLayer
      source: new VectorTile({
        // Use VectorTileSource
        format: new MVT(), // Use MVT format for ArcGIS Vector Tiles
        url: 'https://tiles.arcgis.com/tiles/ubm4tcTYICKBpist/arcgis/rest/services/BC_BASEMAP_20240307/VectorTileServer/tile/{z}/{x}/{y}.pbf', // Updated URL
      }),
      style: styleFunction,
    });

    // Apply the basemap style from the arcgis resource
    fetch(
      'https://www.arcgis.com/sharing/rest/content/items/b1624fea73bd46c681fab55be53d96ae/resources/styles/root.json',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    ).then(function (response) {
      response.json().then(function (glStyle) {
        // DBC22-2153
        glStyle.metadata['ol:webfonts'] =
          '/fonts/{font-family}/{fontweight}{-fontstyle}.css';

        applyStyle(tileLayer, glStyle, 'esri');
      });
    });

    // Set map extent (W, S, E, N)
    const extent = [-155.230138, 36.180153, -102.977437, 66.591323];
    const transformedExtent = transformExtent(extent, 'EPSG:4326', 'EPSG:3857');

    olMap.current = new Map({
      target: mapRef.current,
      layers: [
        // new TileLayer({
        //   source: new OSM(),
        // }),
        tileLayer,
      ],
      view: new View({
        // Centered on Downtown Kelowna
        center: transform(
          [-119.49662112970556, 49.887338062986295],
          'EPSG:4326',
          'EPSG:3857',
        ),
        constrainResolution: true,
        zoom: 7,
        enableRotation: false,
        extent: transformedExtent,
        // maxZoom: 15,
      }),
    });

    return () => {
      if (olMap.current) {
        olMap.current.setTarget(null);
      }
    };
  }, []);

  useEffect(() => {
    if (olMap.current) {
      (rawData.split('\n') ?? []).map((rawDataString) => {
        const trailData: string =
          rawDataString.split('{')?.pop()?.replaceAll('}', '') ?? '';

        const coordinates = trailData.split(',');
        const transformedCoordinates = [];

        // Assuming coordinates are in EPSG:3005 (BC Albers)
        for (let i = 0; i + 1 < coordinates.length; i += 2) {
          const x = parseInt(coordinates[i]);
          const y = parseInt(coordinates[i + 1]);

          try {
            const transformed = transform([x, y], 'EPSG:3005', 'EPSG:3857'); // Transform from EPSG:3005 to WGS 84 (lat/lon)
            transformedCoordinates.push(transformed);
          } catch (e) {
            console.error('Projection transformation error:', e);
          }
        }

        if (transformedCoordinates.length > 0) {
          const lineString = new LineString(transformedCoordinates);
          const feature = new Feature({ geometry: lineString });

          const vectorSource = new VectorSource({ features: [feature] });
          const vectorLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
              stroke: new Stroke({ color: 'red', width: 3 }),
            }),
          });

          olMap.current.addLayer(vectorLayer);
          olMap.current
            .getView()
            .fit(lineString.getExtent(), { padding: [20, 20, 20, 20] });
        }
      });
    }
  }, [olMap.current]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }}></div>;
};
