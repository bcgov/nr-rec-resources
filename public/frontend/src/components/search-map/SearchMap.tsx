import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import OLMap from 'ol/Map';
import Cookies from 'js-cookie';
import { useStore } from '@tanstack/react-store';
import { VectorFeatureMap } from '@bcgov/prp-map';
import Header from '@/components/layout/Header';
import { SearchViewControls } from '@/components/search';
import {
  useClusteredRecreationFeatureLayer,
  useFeatureSelection,
  useRecreationLinesLayer,
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
import { Button, ProgressBar } from 'react-bootstrap';
import { trackClickEvent } from '@/utils/matomo';
import '@/components/search-map/SearchMap.scss';
import { WILDFIRE_LOCATION_MIN_ZOOM } from '@/components/search-map/constants';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import type Feature from 'ol/Feature';
import MapDisclaimerModal from '../rec-resource/RecreationResourceMap/MapDisclaimerModal';
import { useMapFocus } from '@/components/search-map/hooks/useMapFocus';
import Overlay from 'ol/Overlay';
import { LoadingOverlay } from '@shared/components/loading-overlay';

const CLUSTER_OPTIONS = {
  clusterZoomThreshold: 16,
  distance: 50,
  minDistance: 10,
};

const ANIMATED_CLUSTER_OPTIONS = {
  animationDuration: 500,
  declutter: false,
  updateWhileAnimating: false,
  updateWhileInteracting: false,
  renderBuffer: 300,
};

const SearchMap = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { extent, recResourceIds } = useStore(searchResultsStore);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [selectedWildfireFeature, setSelectedWildfireFeature] =
    useState<Feature | null>(null);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  const mapRef = useRef<{ getMap: () => OLMap }>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  useEffect(() => {
    if (!popupRef.current || !mapRef.current) return;
    const overlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      offset: [0, -32],
      stopEvent: true,
    });
    mapRef.current.getMap().addOverlay(overlay);
    overlayRef.current = overlay;

    return () => {
      mapRef.current?.getMap().removeOverlay(overlay);
      overlayRef.current = null;
    };
  }, [mapRef, popupRef]);

  const { layer: clusteredRecreationFeatureLayer } =
    useClusteredRecreationFeatureLayer(recResourceIds, mapRef, {
      clusterOptions: CLUSTER_OPTIONS,
      animatedClusterOptions: ANIMATED_CLUSTER_OPTIONS,
    });

  const { layer: wildfireLocationsLayer } = useWildfireLocationLayer(mapRef, {
    applyHoverStyles: true,
    hideBelowZoom: WILDFIRE_LOCATION_MIN_ZOOM,
  });

  const { layer: wildfirePerimeterLayer } = useWildfirePerimeterLayer(mapRef, {
    applyHoverStyles: false,
    hideBelowZoom: WILDFIRE_LOCATION_MIN_ZOOM,
  });

  const { layer: recreationLinesLayer } = useRecreationLinesLayer(mapRef);

  const featureSelectionLayers = useMemo(
    () => [
      {
        id: 'recreation-features',
        layer: clusteredRecreationFeatureLayer,
        onFeatureSelect: (feature: Feature | null) => {
          setSelectedFeature(feature);
          trackClickEvent({
            category: 'Search Map',
            action: 'Recreation feature selected',
            name: feature
              ? `${feature.get('FOREST_FILE_ID')} | ${feature.get(`PROJECT_NAME`)} | ${feature.get(`PROJECT_TYPE`)}`
              : 'None',
          });
        },
        selectedStyle: locationDotOrangeIcon,
      },
      {
        id: 'wildfire-locations',
        layer: wildfireLocationsLayer,
        onFeatureSelect: (feature: Feature | null) => {
          setSelectedWildfireFeature(feature);
          trackClickEvent({
            category: 'Search Map',
            action: 'Wildfire feature selected',
            name: feature
              ? `Wildfire id: ${feature.get('FIRE_NUMBER')}`
              : 'None',
          });
        },
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
    overlayRef,
    featureLayers: featureSelectionLayers,
    options: {
      featureOffsetY: 150,
    },
  });
  useZoomToExtent(mapRef, extent);

  const { isMapFocusLoading, loadingProgress } = useMapFocus({
    mapRef,
    overlayRef,
    onFocusedFeatureChange: setSelectedFeature,
  });

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
      {
        id: 'recreation-lines',
        layerInstance: recreationLinesLayer,
        visible: true,
      },
    ],
    [
      clusteredRecreationFeatureLayer,
      recreationLinesLayer,
      wildfireLocationsLayer,
      wildfirePerimeterLayer,
    ],
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
    <div className="search-map-container d-flex flex-column vh-100" {...props}>
      <MapDisclaimerModal
        isOpen={isDisclaimerModalOpen}
        setIsOpen={setIsDisclaimerModalOpen}
      />
      <Header />
      <div className="w-100 flex-fill position-relative">
        <LoadingOverlay
          isLoading={isMapFocusLoading}
          message={'Loading map'}
          loader={
            <ProgressBar
              className="w-50"
              now={loadingProgress}
              animated
              striped
            />
          }
        />
        <VectorFeatureMap
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          layers={layers}
          defaultZoom={6}
          minZoom={5.5}
          maxZoom={30}
        />
      </div>
      <div className="search-map-controls">
        <div className="map-search-form">
          <RecreationSuggestionForm
            disableNavigation={true}
            searchBtnVariant="secondary"
            trackingSource="Search page map view"
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
