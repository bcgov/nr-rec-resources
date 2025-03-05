import React, { useEffect, useRef } from 'react';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorTileSource from 'ol/source/VectorTile';
import { get as getProjection, transform, transformExtent } from 'ol/proj';
import { Fill, Stroke, Style } from 'ol/style';
import { Map } from 'ol';

// Import proj4 and register function
import { register } from 'ol/proj/proj4';
import CircleStyle from '~/ol/style/Circle';
import { GeoJSON, MVT } from '~/ol/format';
import { RecreationResourceDto } from '@/service/recreation-resource';
import {
  Geometry,
  LineString,
  MultiLineString,
  MultiPoint,
  Point,
  Polygon,
} from '~/ol/geom';
import proj4 from 'proj4';
import { applyStyle } from 'ol-mapbox-style';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorSource from 'ol/source/Vector';

// Define and register EPSG:3005 projection
proj4.defs(
  'EPSG:3005',
  '+proj=aea +lat_0=45 +lon_0=-126 +lat_1=50 +lat_2=58.5 +x_0=1000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs',
);
register(proj4);

const proj3005 = getProjection('EPSG:3005') ?? 'EPSG:3857';

interface TrailMapProps {
  recResource?: RecreationResourceDto | undefined;
}

export const TrailMap = ({ recResource }: TrailMapProps) => {
  const mapRef = useRef<HTMLDivElement>(undefined);
  const olMap = useRef<Map>(null);

  useEffect(() => {
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
      declutter: true,
      // Use VectorTileLayer
      source: new VectorTileSource({
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
        applyStyle(tileLayer, glStyle, 'esri')
          .then(console.log)
          .catch(console.error);
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
        center: transform([1758871.897, 514456.792], proj3005, 'EPSG:3857'),
        constrainResolution: true,
        zoom: 7,
        enableRotation: false,
        extent: transformedExtent,
        maxZoom: 15,
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
      const geojsonFormat = new GeoJSON();

      const dummyData = {
        type: 'Polygon',
        coordinates: [
          [
            transform([1758871.897, 514456.792], 'EPSG:3005', 'EPSG:3857'),
            [1758911.097, 514194.33],
            transform([1759708.351, 514313.399], 'EPSG:3005', 'EPSG:3857'),
            [1759708.351, 514313.399],
            [1759661.614, 514626.327],
            [1759649.021, 514710.66],
            [1759380.326, 514670.534],
            [1759263.808, 514653.135],
            [1758851.773, 514591.592],
            [1758871.897, 514456.792],

            [1e6, -6e6],
            [3e6, -6e6],
            [2e6, -4e6],
            [1e6, -6e6],
          ],
        ],
      };

      const features = geojsonFormat.readFeatures(JSON.stringify(dummyData));

      features.map((geom) => geom.getGeometry());

      const vectorSource = new VectorSource({
        features,
        // format: new GeoJSON({
        //   dataProjection: 'EPSG:3005',
        //   featureProjection: 'EPSG:3857',
        // }),
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          stroke: new Stroke({ color: 'blue', width: 30 }),
        }),
      });

      olMap.current.addLayer(vectorLayer);
    }
  }, [recResource, olMap.current]);

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }}></div>;
};

const printCoords = (geometry: Geometry) => {
  const geometryType = geometry.getType();
  let coordinates: number[] | number[][] | number[][][] | undefined; // Define a flexible type for coordinates

  if (geometryType === 'Point') {
    coordinates = (geometry as Point).getCoordinates(); // Type assertion to Point
    console.log('Point Coordinates:', coordinates);
  } else if (geometryType === 'LineString') {
    coordinates = (geometry as LineString).getCoordinates(); // Type assertion to LineString
    console.log('LineString Coordinates:', coordinates);
  } else if (geometryType === 'Polygon') {
    coordinates = (geometry as Polygon).getCoordinates(); // Type assertion to Polygon
    console.log('Polygon Coordinates:', coordinates);
  } else if (geometryType === 'MultiPoint') {
    coordinates = (geometry as MultiPoint).getCoordinates(); // Type assertion to MultiPoint
    console.log('MultiPoint Coordinates:', coordinates);
  } else if (geometryType === 'MultiLineString') {
    coordinates = (geometry as MultiLineString).getCoordinates(); // Type assertion to MultiLineString
    console.log('MultiLineString Coordinates:', coordinates);
  }
};
