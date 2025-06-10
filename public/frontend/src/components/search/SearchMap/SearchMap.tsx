import { CSSProperties, useEffect, useMemo, useRef } from 'react';
import 'ol/ol.css';
import type OLMap from 'ol/Map';
import { transformExtent } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { useStore } from '@tanstack/react-store';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import {
  createRecreationFeatureSource,
  createRecreationIconStyle,
  createRecreationLabelStyle,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import VectorLayer from 'ol/layer/Vector';
import searchResultsStore from '@/store/searchResults';
import { RecreationSearchForm } from '@/components/recreation-search-form/RecreationSearchForm';
import '@/components/search/SearchMap/SearchMap.scss';
import { FILTERED_IDS } from '@/components/search/SearchMap/constants';

const TILE_SIZE = 512;
const MAX_TEXT_RESOLUTION = 900;

interface SearchableMapProps {
  style?: CSSProperties;
}

const SearchMap = ({ style }: SearchableMapProps) => {
  const { extent, pages, recResourceIds } = useStore(searchResultsStore);

  const mapRef = useRef<{ getMap: () => OLMap }>(null);

  const featureSource = useMemo(
    () =>
      createRecreationFeatureSource({
        tileSize: TILE_SIZE,
      }),
    [],
  );

  // Use same feature source but separate layers for icons and labels
  // to allow decluttering of labels while keeping icons visible
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

  useEffect(() => {
    if (!extent || !mapRef.current) return;

    try {
      const geojson = JSON.parse(extent);
      const format = new GeoJSON();
      const geometry = format.readGeometry(geojson);
      const olExtent3005 = geometry.getExtent();

      const olExtent3857 = transformExtent(
        olExtent3005,
        'EPSG:3005',
        'EPSG:3857',
      );

      const map = mapRef.current.getMap();
      const view = map.getView();

      map.once('moveend', () => {
        // Mitigate white tile issue after zooming to extent,
        // we just give the zoom a slight nudge to render correctly
        const zoom = view.getZoom();
        if (zoom != null) {
          view.setZoom(zoom + 0.01);
        }
      });

      view.fit(olExtent3857, {
        padding: [50, 50, 50, 50],
        maxZoom: 16,
        duration: 500,
      });
    } catch (err) {
      console.error('Failed to parse or fit extent:', err);
    }
  }, [extent]);

  useEffect(() => {
    if (!pages || pages.length === 0) return;
    iconLayerRef.current.setStyle(createRecreationIconStyle(recResourceIds));
    labelLayerRef.current.setStyle(createRecreationLabelStyle(recResourceIds));
    featureSource.refresh();
  }, [recResourceIds, pages, featureSource]);

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
