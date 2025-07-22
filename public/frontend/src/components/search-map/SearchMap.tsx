import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { useMemo, useRef, useState } from 'react';
import OLMap from 'ol/Map';
import { useStore } from '@tanstack/react-store';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import { useClusteredRecreationFeatureLayer } from '@/components/search-map/hooks/useClusteredRecreationFeatureLayer';
import { useRecreationFeatureLayerPreview } from '@/components/search-map/hooks/useRecreationFeatureLayerPreview';
import { useZoomToExtent } from '@/components/search-map/hooks/useZoomToExtent';
import searchResultsStore from '@/store/searchResults';
import RecreationResourcePreview from '@/components/search-map/RecreationFeaturePreview';
import FilterMenuSearchMap from '@/components/search/filters/FilterMenuSearchMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import { RecreationSearchForm } from '@/components/recreation-search-form/RecreationSearchForm';
import '@/components/search-map/SearchMap.scss';
import type Feature from 'ol/Feature';

const SearchMap = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { extent, recResourceIds } = useStore(searchResultsStore);
  const mapRef = useRef<{ getMap: () => OLMap }>(null);

  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  useZoomToExtent(mapRef, extent);

  const { layer: clusteredRecreationFeatureLayer } =
    useClusteredRecreationFeatureLayer(recResourceIds, mapRef, {
      clusterOptions: {
        clusterZoomThreshold: 16,
        distance: 50,
        minDistance: 10,
      },
      animatedClusterOptions: {
        animationDuration: 500,
        declutter: false,
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        renderBuffer: 300,
      },
    });

  const featurePreviewPopupRef = useRecreationFeatureLayerPreview({
    mapRef,
    layer: clusteredRecreationFeatureLayer,
    onFeatureSelect: setSelectedFeature,
  });

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
        style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
        layers={layers}
        defaultZoom={6}
        minZoom={5.5}
        maxZoom={30}
      />
      <div className="search-map-controls">
        <RecreationSearchForm />
        <div className="d-flex flex-col flex-lg-row align-items-center gap-2">
          <Button
            variant={isFilterMenuOpen ? 'primary' : 'secondary'}
            className="search-chip"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            aria-label="Toggle filter menu"
          >
            <FontAwesomeIcon icon={faSliders} className="me-2" />
            Filters
          </Button>
          <SearchViewControls variant="list" />
          <FilterMenuSearchMap
            isOpen={isFilterMenuOpen}
            setIsOpen={setIsFilterMenuOpen}
          />
        </div>
      </div>

      <div ref={featurePreviewPopupRef} className="search-map-feature-preview">
        {selectedFeature && (
          <RecreationResourcePreview
            rec_resource_id={selectedFeature.get('FOREST_FILE_ID')}
          />
        )}
      </div>
    </div>
  );
};

export default SearchMap;
