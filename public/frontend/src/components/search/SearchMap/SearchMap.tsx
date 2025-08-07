import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import OLMap from 'ol/Map';
import { useStore } from '@tanstack/react-store';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import { useClusteredRecreationFeatureLayer } from '@/components/search/SearchMap/hooks/useClusteredRecreationFeatureLayer';
import { useRecreationFeatureLayerPreview } from '@/components/search/SearchMap/hooks/useRecreationFeatureLayerPreview';
import { useZoomToExtent } from '@/components/search/SearchMap/hooks/useZoomToExtent';
import searchResultsStore from '@/store/searchResults';
import RecreationResourcePreview from '@/components/search/SearchMap/RecreationFeaturePreview';
import { RecreationSearchForm } from '@/components/recreation-search-form/RecreationSearchForm';
import '@/components/search/SearchMap/SearchMap.scss';
import type Feature from 'ol/Feature';
import MapDisclaimerModal from '@/components/rec-resource/RecreationResourceMap/MapDisclaimerModal';

const SearchMap = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { extent, recResourceIds } = useStore(searchResultsStore);
  const mapRef = useRef<{ getMap: () => OLMap }>(null);

  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

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

  useEffect(() => {
    if (props.style?.visibility === 'visible') {
      const hideDialog = Cookies.get('hidemap-disclaimer-dialog');
      if (!hideDialog) {
        setIsDisclaimerModalOpen(true);
      }
    }
  }, [props, props.style]);

  return (
    <div className="search-map-container" {...props}>
      <MapDisclaimerModal
        isOpen={isDisclaimerModalOpen}
        setIsOpen={setIsDisclaimerModalOpen}
      />
      <VectorFeatureMap
        ref={mapRef}
        style={{ width: '100%', height: '100%', backgroundColor: 'white' }}
        layers={layers}
        defaultZoom={6}
        minZoom={5.5}
        maxZoom={30}
      />
      <div className="search-map-view-controls">
        <RecreationSearchForm />
        <SearchViewControls />
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
