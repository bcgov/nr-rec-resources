import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { VectorFeatureMap, useStyledLayer } from '@bcgov/prp-map';
import EsriJSON from 'ol/format/EsriJSON';
import { GeoJSON } from 'ol/format';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import OLMap from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import { isEmpty as isEmptyExtent } from 'ol/extent';
import { bbox as bboxLoadingStrategy } from 'ol/loadingstrategy';
import { Fill, Stroke, Style } from 'ol/style';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import {
  MAP_PROJECTION_BC_ALBERS,
  MAP_PROJECTION_WEB_MERCATOR,
} from '@shared/components/recreation-resource-map/constants';

proj4.defs(
  MAP_PROJECTION_BC_ALBERS,
  '+proj=aea +lat_1=50 +lat_2=58.5 +lat_0=45 +lon_0=-126 +x_0=1000000 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
);
register(proj4);

interface SpatialSubmissionEditorMapProps {
  features: any[];
}

const SOURCE_LAYER_ID = 'submission-editor-layer';
const ESRI_WORLD_IMAGERY_TILE_URL =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const CANADA_TOPO_VECTOR_TILE_URL =
  'https://tiles.arcgis.com/tiles/B6yKvIZqzuOr0jBR/arcgis/rest/services/Canada_Topographic/VectorTileServer/tile/{z}/{y}/{x}.pbf';
const CANADA_TOPO_STYLE_URL =
  'https://www.arcgis.com/sharing/rest/content/items/85e2f70a08494305b60af53bd6fd5cbe/resources/styles/root.json';

const OPTIONAL_REFERENCE_LAYERS = [
  {
    id: 'private-lot',
    label: 'Private lot',
    featureServerUrl:
      'https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/DITG_2020_PrivateLand/FeatureServer/5',
    layerId: 5,
    color: '#ff9800',
  },
  {
    id: 'bc-forest-tenure-road',
    label: 'BC forest tenure road',
    featureServerUrl:
      'https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/British_Columbia_Forest_Tenure_Road_Section_Lines_-_View/FeatureServer',
    layerId: 3,
    color: '#ff5252',
  },
  {
    id: 'consolidated-road',
    label: 'Consolidated road',
    featureServerUrl:
      'https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/ConsolidatedRoads_2021_20230111_web/FeatureServer',
    layerId: 77,
    color: '#8e24aa',
  },
] as const;

const createFeatureServerGeoJsonQueryUrl = (
  featureServerUrl: string,
  layerId: number,
  extent: number[],
): string => {
  const normalizedFeatureServerUrl = featureServerUrl.replace(/\/$/, '');
  const featureLayerUrlPattern = /\/FeatureServer\/\d+$/i;
  const queryUrl = featureLayerUrlPattern.test(normalizedFeatureServerUrl)
    ? `${normalizedFeatureServerUrl}/query`
    : `${normalizedFeatureServerUrl}/${layerId}/query`;
  const searchParams = new URLSearchParams({
    where: '1=1',
    outFields: '*',
    returnGeometry: 'true',
    inSR: '3857',
    outSR: '3857',
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    geometry: `${extent[0]},${extent[1]},${extent[2]},${extent[3]}`,
    f: 'json',
  });

  return `${queryUrl}?${searchParams.toString()}`;
};

const featureStyle = new Style({
  stroke: new Stroke({ color: '#1976d2', width: 3 }),
  fill: new Fill({ color: 'rgba(25, 118, 210, 0.2)' }),
});

const createReferenceLayerStyle = (color: string): Style =>
  new Style({
    stroke: new Stroke({ color, width: 2 }),
    fill: new Fill({ color: `${color}33` }),
  });

export const SpatialSubmissionMap = ({
  features,
}: SpatialSubmissionEditorMapProps) => {
  const mapRef = useRef<{ getMap: () => OLMap } | null>(null);
  const hasAutoFitRef = useRef(false);

  const vectorSource = useMemo(() => new VectorSource(), []);
  const [enabledReferenceLayerIds, setEnabledReferenceLayerIds] = useState<
    string[]
  >([]);

  const canadaTopographicLayerBasic = useStyledLayer(
    CANADA_TOPO_VECTOR_TILE_URL,
    CANADA_TOPO_STYLE_URL,
    'esri',
  );

  const baseLayers = useMemo(
    () => [
      {
        id: 'satellite',
        name: 'Satellite',
        layer: new LayerGroup({
          layers: [
            new TileLayer({
              source: new XYZ({
                url: ESRI_WORLD_IMAGERY_TILE_URL,
                attributions: 'Esri World Imagery',
                cacheSize: 512,
                maxZoom: 18,
              }),
              preload: 4,
              useInterimTilesOnError: true,
            }),
            canadaTopographicLayerBasic,
          ] as BaseLayer[],
        }),
      },
    ],
    [canadaTopographicLayerBasic],
  );

  const editorLayer = useMemo(
    () =>
      new VectorLayer({
        source: vectorSource,
        style: featureStyle,
        zIndex: 10,
      }),
    [vectorSource],
  );

  const layers = useMemo(() => {
    const referenceLayers = OPTIONAL_REFERENCE_LAYERS.filter((layer) =>
      enabledReferenceLayerIds.includes(layer.id),
    ).map((layer) => {
      const source = new VectorSource({
        format: new EsriJSON(),
        strategy: bboxLoadingStrategy,
        url: (extent) =>
          createFeatureServerGeoJsonQueryUrl(
            layer.featureServerUrl,
            layer.layerId,
            extent,
          ),
      });

      source.on('featuresloaderror', () => {
        // Debug hint when a selected reference layer fails to load.
        console.error(
          `[SPATIAL MAP] Failed to load reference layer: ${layer.label}`,
        );
      });

      return {
        id: `reference-${layer.id}`,
        layerInstance: new VectorLayer({
          source,
          style: createReferenceLayerStyle(layer.color),
          zIndex: 4,
        }),
        visible: true,
      };
    });

    return [
      ...referenceLayers,
      {
        id: SOURCE_LAYER_ID,
        layerInstance: editorLayer,
        visible: true,
      },
    ];
  }, [editorLayer, enabledReferenceLayerIds]);

  const toggleReferenceLayer = (layerId: string) => {
    setEnabledReferenceLayerIds((previousLayerIds) => {
      if (previousLayerIds.includes(layerId)) {
        return previousLayerIds.filter(
          (existingLayerId) => existingLayerId !== layerId,
        );
      }

      return [...previousLayerIds, layerId];
    });
  };

  const fitToSourceExtent = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const extent = vectorSource.getExtent();
    if (!extent || isEmptyExtent(extent)) return;

    map.getView().fit(extent, {
      padding: [40, 40, 40, 40],
      maxZoom: 15,
      duration: 250,
    });
  }, [vectorSource]);

  useEffect(() => {
    vectorSource.clear();

    if (!features.length) {
      hasAutoFitRef.current = false;
      return;
    }

    const geoJson = new GeoJSON({
      dataProjection: MAP_PROJECTION_BC_ALBERS,
      featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    });

    const nextFeatures = geoJson.readFeatures({
      type: 'FeatureCollection',
      features,
    });

    vectorSource.addFeatures(nextFeatures);

    if (!hasAutoFitRef.current) {
      fitToSourceExtent();
      hasAutoFitRef.current = true;
    }
  }, [features, fitToSourceExtent, vectorSource]);

  return (
    <div>
      <Alert variant="light" className="py-2 px-3 mb-2">
        <strong>Reference layers</strong>
        <div className="d-flex flex-wrap gap-3 mt-2">
          {OPTIONAL_REFERENCE_LAYERS.map((layer) => (
            <Form.Check
              key={layer.id}
              type="checkbox"
              id={`layer-toggle-${layer.id}`}
              label={layer.label}
              checked={enabledReferenceLayerIds.includes(layer.id)}
              onChange={() => toggleReferenceLayer(layer.id)}
            />
          ))}
        </div>
      </Alert>

      <VectorFeatureMap
        ref={mapRef}
        style={{ height: '48vh', minHeight: '420px', maxHeight: '560px' }}
        layers={layers}
        baseLayers={baseLayers}
        defaultZoom={12}
        minZoom={5.5}
        maxZoom={18}
      />
    </div>
  );
};
