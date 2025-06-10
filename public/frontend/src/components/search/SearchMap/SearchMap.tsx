import { CSSProperties, useMemo } from 'react';
import 'ol/ol.css';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import {
  createRecreationFeatureSource,
  createRecreationFeatureLayer,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import '@/components/search/SearchMap/SearchMap.scss';

const TILE_SIZE = 512;
const MAX_TEXT_RESOLUTION = 900;

interface SearchableMapProps {
  style?: CSSProperties;
}

const SearchMap = ({ style }: SearchableMapProps) => {
  const featureSource = useMemo(
    () => createRecreationFeatureSource(TILE_SIZE),
    [],
  );

  const featureLayer = useMemo(
    () =>
      createRecreationFeatureLayer(featureSource, {
        maxTextResolution: MAX_TEXT_RESOLUTION,
        declutter: true,
        updateWhileInteracting: false,
        updateWhileAnimating: false,
      }),
    [featureSource],
  );

  const layers = useMemo(
    // Add layers here
    () => [{ id: 'features', layerInstance: featureLayer, visible: true }],
    [featureLayer],
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
