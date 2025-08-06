import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { useMemo, useRef, useState } from 'react';
import OLMap from 'ol/Map';
import { useStore } from '@tanstack/react-store';
import { VectorFeatureMap } from '@bcgov/prp-map';
import Header from '@/components/layout/Header';
import { SearchViewControls } from '@/components/search';
import {
  useClusteredRecreationFeatureLayer,
  useFeatureSelection,
  useWildfireLocationLayer,
  useWildfirePerimeterLayer,
  useZoomToExtent,
} from '@/components/search-map/hooks';
import { locationDotOrangeIcon } from '@/components/search-map/styles/icons';
import searchResultsStore from '@/store/searchResults';
import {
  RecreationFeaturePreview,
  WildfireFeaturePreview,
} from '@/components/search-map/preview';
import FilterMenuSearchMap from '@/components/search/filters/FilterMenuSearchMap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import '@/components/search-map/SearchMap.scss';
import { WILDFIRE_LOCATION_MIN_ZOOM } from '@/components/search-map/constants';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import type Feature from 'ol/Feature';

const SearchMap = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { extent, recResourceIds } = useStore(searchResultsStore);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedWildfireFeature, setSelectedWildfireFeature] =
    useState<Feature | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  const mapRef = useRef<{ getMap: () => OLMap }>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

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

  const { layer: wildfireLocationsLayer } = useWildfireLocationLayer(mapRef, {
    applyHoverStyles: true,
    hideBelowZoom: WILDFIRE_LOCATION_MIN_ZOOM,
  });

  const { layer: wildfirePerimeterLayer } = useWildfirePerimeterLayer(mapRef, {
    applyHoverStyles: false,
    hideBelowZoom: WILDFIRE_LOCATION_MIN_ZOOM,
  });

  const featureSelectionLayers = useMemo(
    () => [
      {
        id: 'recreation-features',
        layer: clusteredRecreationFeatureLayer,
        onFeatureSelect: setSelectedFeature,
        selectedStyle: locationDotOrangeIcon,
      },
      {
        id: 'wildfire-locations',
        layer: wildfireLocationsLayer,
        onFeatureSelect: setSelectedWildfireFeature,
        selectedStyle: locationDotOrangeIcon,
      },
    ],
    [
      clusteredRecreationFeatureLayer,
      wildfireLocationsLayer,
      setSelectedFeature,
      setSelectedWildfireFeature,
    ],
  );

  const { clearSelection } = useFeatureSelection({
    mapRef,
    popupRef,
    featureLayers: featureSelectionLayers,
    options: {
      featureOffsetY: 150,
    },
  });
  useZoomToExtent(mapRef, extent);

  const layers = useMemo(
    () => [
      {
        id: 'wildfire-perimeters',
        layerInstance: wildfirePerimeterLayer,
        visible: true,
      },
      {
        id: 'wildfire-locations',
        layerInstance: wildfireLocationsLayer,
        visible: true,
      },
      {
        id: 'recreation-features',
        layerInstance: clusteredRecreationFeatureLayer,
        visible: true,
      },
    ],
    [
      clusteredRecreationFeatureLayer,
      wildfireLocationsLayer,
      wildfirePerimeterLayer,
    ],
  );

  return (
    <div className="search-map-container" {...props}>
      <Header />
      <VectorFeatureMap
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        layers={layers}
        defaultZoom={6}
        minZoom={5.5}
        maxZoom={30}
      />
      <div className="search-map-controls">
        <div className="map-search-form">
          <RecreationSuggestionForm
            disableNavigation={true}
            searchBtnVariant="secondary"
          />
          <Button
            variant={isFilterMenuOpen ? 'primary' : 'secondary'}
            className="filter-btn d-sm-none d-md-block"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            aria-label="Toggle filter menu desktop"
          >
            Filters
          </Button>
        </div>
        <div className="d-flex flex-col flex-lg-row align-items-center gap-2">
          <Button
            variant={isFilterMenuOpen ? 'primary' : 'secondary'}
            className="search-chip d-sm-block d-md-none"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            aria-label="Toggle filter menu mobile"
          >
            <FontAwesomeIcon icon={faSliders} className="me-2" />
            Filters
          </Button>
          <SearchViewControls variant="list" />
        </div>
        <FilterMenuSearchMap
          isOpen={isFilterMenuOpen}
          setIsOpen={setIsFilterMenuOpen}
        />
      </div>
      <div ref={popupRef} className="search-map-feature-preview">
        {selectedFeature && (
          <RecreationFeaturePreview
            rec_resource_id={selectedFeature.get('FOREST_FILE_ID')}
          />
        )}
        {selectedWildfireFeature && (
          <WildfireFeaturePreview
            onClose={() => {
              clearSelection();
              setSelectedWildfireFeature(null);
            }}
            wildfireFeature={selectedWildfireFeature}
          />
        )}
      </div>
    </div>
  );
};

export default SearchMap;
