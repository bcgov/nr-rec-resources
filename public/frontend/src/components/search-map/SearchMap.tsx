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
import { trackClickEvent } from '@shared/utils';
import { MATOMO_SEARCH_CONTEXT_MAP } from '@/constants/analytics';
import {
  ANIMATED_CLUSTER_OPTIONS,
  CLUSTER_OPTIONS,
  LEGACY_MAP_LINK,
  WILDFIRE_LOCATION_MIN_ZOOM,
} from '@/components/search-map/constants';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import type Feature from 'ol/Feature';
import MapDisclaimerModal from '@/components/search-map/MapDisclaimerModal';
import { useMapFocus } from '@/components/search-map/hooks/useMapFocus';
import Overlay from 'ol/Overlay';
import { LoadingOverlay } from '@shared/components/loading-overlay';
import { useBaseMaps } from '@/components/search-map/hooks/useBaseMaps';
import '@/components/search-map/SearchMap.scss';

interface SearchViewControlsProps {
  totalCount: number;
  ids: string[];
  props: React.HTMLAttributes<HTMLDivElement>;
}

const SearchMap = (searchViewControlsProps: SearchViewControlsProps) => {
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
      // eslint-disable-next-line
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
  });
  useZoomToExtent(mapRef, extent);

  const { isMapFocusLoading, loadingProgress } = useMapFocus({
    mapRef,
    overlayRef,
    onFocusedFeatureChange: setSelectedFeature,
  });

  const baseLayers = useBaseMaps();

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

  useEffect(() => {
    if (searchViewControlsProps.props.style?.visibility === 'visible') {
      const hideDialog = Cookies.get('hidemap-disclaimer-dialog');
      if (!hideDialog) {
        setIsDisclaimerModalOpen(true);
      }
    }
  }, [searchViewControlsProps.props, searchViewControlsProps.props.style]);

  const storeLocation = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const view = map.getView();
    const zoom = view.getZoom();
    const center = view.getCenter();
    if (zoom && center) {
      sessionStorage.setItem('locationZoomState', `${zoom}`);
      sessionStorage.setItem('locationCenterState', `${center}`);
    }
  };

  return (
    <div
      className="search-map-container d-flex flex-column vh-100"
      {...searchViewControlsProps.props}
    >
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
          enableTracking
          style={{ width: '100%', height: '100%' }}
          layers={layers}
          baseLayers={baseLayers}
          defaultZoom={5}
          minZoom={5.5}
          maxZoom={30}
        />
        <div className="link-to-legacy">
          <a href={LEGACY_MAP_LINK} target="_blank" rel="noreferrer">
            Link to legacy map
          </a>
        </div>
      </div>
      <div className="search-map-controls">
        <div className="map-search-form">
          <RecreationSuggestionForm
            disableNavigation={true}
            searchBtnVariant="secondary"
            trackingContext={MATOMO_SEARCH_CONTEXT_MAP}
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
          <SearchViewControls
            variant="list"
            totalCount={searchViewControlsProps.totalCount}
            ids={searchViewControlsProps.ids}
            trackingView="map"
          />
        </div>
        <FilterMenuSearchMap
          isOpen={isFilterMenuOpen}
          setIsOpen={setIsFilterMenuOpen}
        />
      </div>
      <div
        ref={popupRef}
        className="search-map-feature-preview"
        onClick={() => storeLocation()}
      >
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
