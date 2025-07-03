import { useRef, useMemo } from 'react';
import 'ol/ol.css';
import OLMap from 'ol/Map';
import { useStore } from '@tanstack/react-store';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import { useClusteredRecreationFeatureLayer } from '@/components/search/SearchMap/hooks/useClusteredRecreationFeatureLayer';
import { useZoomToExtent } from '@/components/search/SearchMap/hooks/useZoomToExtent';
import searchResultsStore from '@/store/searchResults';
import { RecreationSearchForm } from '@/components/recreation-search-form/RecreationSearchForm';
import '@/components/search/SearchMap/SearchMap.scss';

const SearchMap = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { extent, recResourceIds } = useStore(searchResultsStore);

  const mapRef = useRef<{ getMap: () => OLMap }>(null);

  const { layer: clusteredRecreationFeatureLayer } =
    useClusteredRecreationFeatureLayer(recResourceIds, {
      animationDuration: 500,
      declutter: false,
      updateWhileAnimating: false,
      updateWhileInteracting: false,
      renderBuffer: 300,
    });

  useZoomToExtent(mapRef, extent);

  const layers = useMemo(
    () => [
      {
        id: 'recreation-features',
        layerInstance: clusteredRecreationFeatureLayer,
        visible: true,
      },
    ],
    [clusteredRecreationFeatureLayer],
  );

  return (
    <div className="search-map-container" {...props}>
      <VectorFeatureMap
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
        }}
        layers={layers}
        defaultZoom={6}
        minZoom={5.5}
        maxZoom={30}
      />

      <div className="search-map-view-controls">
        <RecreationSearchForm />
        <SearchViewControls />
      </div>
    </div>
  );
};

export default SearchMap;
