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
import '@/components/search/SearchMap/SearchMap.scss';
import { FILTERED_IDS } from '@/components/search/SearchMap/constants';

const TILE_SIZE = 512;
const MAX_TEXT_RESOLUTION = 900;

interface SearchableMapProps {
  style?: CSSProperties;
}

const SearchMap = ({ style }: SearchableMapProps) => {
  const [filteredIds, setFilteredIds] = useState<string[]>([]);

  // Memoized source (constant across re-renders)
  const featureSource = useMemo(
    () => createRecreationFeatureSource(TILE_SIZE),
    [],
  );

  // Layer refs (persistent across renders)
  const iconLayerRef = useRef<VectorLayer>(
    new VectorLayer({
      source: featureSource,
      declutter: false,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
    }),
  );

  const labelLayerRef = useRef<VectorLayer>(
    new VectorLayer({
      source: featureSource,
      declutter: true,
      updateWhileInteracting: false,
      updateWhileAnimating: false,
      maxResolution: MAX_TEXT_RESOLUTION,
    }),
  );

  // Set styles for the layers when filteredIds change
  useEffect(() => {
    iconLayerRef.current.setStyle(createRecreationIconStyle(filteredIds));
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
        <button
          className="btn btn-secondary"
          onClick={() => setFilteredIds(FILTERED_IDS)}
        >
          Set id list
        </button>
      </div>
    </div>
  );
};

export default SearchMap;
