import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import 'ol/ol.css';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import {
  createRecreationFeatureSource,
  createRecreationIconStyle,
  createRecreationLabelStyle,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import '@/components/search/SearchMap/SearchMap.scss';

const TILE_SIZE = 512;
const MAX_TEXT_RESOLUTION = 900;

interface SearchableMapProps {
  style?: CSSProperties;
}

const SearchMap = ({ style }: SearchableMapProps) => {
  // Setting a list filteredIds will dynamically filter the recreation feature layer
  const [filteredIds] = useState<string[]>([]);

  const featureSource = useMemo(
    () =>
      createRecreationFeatureSource({
        tileSize: TILE_SIZE,
      }),
    [],
  );

  const clusterSource = useMemo(
    () =>
      new Cluster({
        distance: 40, // or your desired distance
        minDistance: 1, // optional
        source: featureSource,
      }),
    [featureSource],
  );

  // Use same feature source but separate layers for icons and labels
  // to allow decluttering of labels while keeping icons visible
  const iconLayerRef = useRef<VectorLayer>(
    new VectorLayer({
      source: clusterSource,
      declutter: false,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
    }),
  );

  const labelLayerRef = useRef<VectorLayer>(
    new VectorLayer({
      source: clusterSource,
      declutter: true,
      updateWhileInteracting: false,
      updateWhileAnimating: false,
      maxResolution: MAX_TEXT_RESOLUTION,
    }),
  );

  const clusterStyle = (feature: any) => {
    const size = feature.get('features')?.length || 1;
    if (size === 1) {
      // Single feature, use the existing icon style
      return createRecreationIconStyle([])(feature);
    }
    return new Style({
      image: new CircleStyle({
        radius: 18,
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
        fill: new Fill({
          color: '#1976d2',
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({
          color: '#fff',
        }),
        stroke: new Stroke({
          color: '#333',
          width: 2,
        }),
        font: 'bold 16px sans-serif',
      }),
    });
  };

  useEffect(() => {
    iconLayerRef.current.setStyle(clusterStyle);
    labelLayerRef.current.setStyle(createRecreationLabelStyle(filteredIds));
  }, [filteredIds]);

  const layers = useMemo(
    () => [
      {
        id: 'recreation-icons',
        layerInstance: iconLayerRef.current,
        visible: true,
      },
      {
        id: 'recreation-labels',
        layerInstance: labelLayerRef.current,
        visible: true,
      },
    ],
    [],
  );

  return (
    <div className="search-map-container" style={style}>
      <VectorFeatureMap
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
        }}
        layers={layers}
        defaultZoom={8}
      />

      <div className="search-map-view-controls">
        <SearchViewControls />
      </div>
    </div>
  );
};

export default SearchMap;
