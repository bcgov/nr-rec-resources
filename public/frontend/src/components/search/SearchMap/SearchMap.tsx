import { useEffect, useMemo, useRef } from 'react';
import 'ol/ol.css';
import type OLMap from 'ol/Map';
import { transformExtent } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { useStore } from '@tanstack/react-store';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import {
  createClusteredRecreationFeatureSource,
  createClusteredRecreationFeatureStyle,
  createClusteredRecreationFeatureLayer,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import searchResultsStore from '@/store/searchResults';
import { RecreationSearchForm } from '@/components/recreation-search-form/RecreationSearchForm';
import '@/components/search/SearchMap/SearchMap.scss';

const SearchMap = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { extent, pages, recResourceIds } = useStore(searchResultsStore);

  const mapRef = useRef<{ getMap: () => OLMap }>(null);

  const clusteredSource = useMemo(
    () => createClusteredRecreationFeatureSource(recResourceIds),
    [recResourceIds],
  );

  const clusteredStyle = useMemo(
    () => createClusteredRecreationFeatureStyle(recResourceIds),
    [recResourceIds],
  );

  const featureRef = useRef(
    createClusteredRecreationFeatureLayer(clusteredSource, clusteredStyle, {
      animationDuration: 500,
      declutter: false,
      updateWhileAnimating: false,
      updateWhileInteracting: false,
      renderBuffer: 300,
    }),
  );

  useEffect(() => {
    if (!featureRef.current) return;

    const newSource = createClusteredRecreationFeatureSource(recResourceIds);
    featureRef.current.setSource(newSource);
  }, [recResourceIds]);

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
    featureRef.current.setStyle(
      createClusteredRecreationFeatureStyle(recResourceIds),
    );
  }, [recResourceIds, pages]);

  const layers = useMemo(
    () => [
      {
        id: 'recreation-features',
        layerInstance: featureRef.current,
        visible: true,
      },
    ],
    [],
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
