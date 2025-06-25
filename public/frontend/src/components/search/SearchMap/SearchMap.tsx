import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import 'ol/ol.css';
import { VectorFeatureMap } from '@bcgov/prp-map';
import { SearchViewControls } from '@/components/search';
import {
  createRecreationFeatureSource,
  createRecreationIconStyle,
} from '@/components/search/SearchMap/layers/recreationFeatureLayer';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import Map from 'ol/Map';
import { getCenter } from 'ol/extent';
import '@/components/search/SearchMap/SearchMap.scss';
import { FeatureLike } from 'ol/Feature';

const TILE_SIZE = 512;

interface SearchableMapProps {
  style?: CSSProperties;
}

function getSpiderfyPositions(
  center: [number, number],
  count: number,
  radius = 20,
) {
  const angleStep = (2 * Math.PI) / count;
  return Array.from({ length: count }, (_, i) => [
    center[0] + radius * Math.cos(i * angleStep),
    center[1] + radius * Math.sin(i * angleStep),
  ]);
}

const SearchMap = ({ style }: SearchableMapProps) => {
  // Setting a list filteredIds will dynamically filter the recreation feature layer
  const [filteredIds] = useState<string[]>([]);

  // Add a ref to store the map instance
  const mapRef = useRef<Map | null>(null);

  const featureSource = useMemo(
    () =>
      createRecreationFeatureSource({
        tileSize: TILE_SIZE,
      }),
    [],
  );

  const clusterSource = useMemo(
    () =>
      new Cluster({
        distance: 40,
        // minDistance: 40,
        source: featureSource,
      }),
    [featureSource],
  );

  // Use same feature source but separate layers for icons and labels
  // to allow decluttering of labels while keeping icons visible
  const iconLayerRef = useRef<VectorLayer>(
    new VectorLayer({
      source: clusterSource,
      declutter: false,
      updateWhileInteracting: false,
      updateWhileAnimating: false,
    }),
  );

  const clusterStyle = (feature: any) => {
    const size = feature.get('features')?.length || 1;
    const features = feature.get('features');
    const view = mapRef.current?.getView();
    const zoom = view?.getZoom() ?? 8;

    if (size === 1) {
      // Single feature, use the existing icon style
      return createRecreationIconStyle(filteredIds)(feature.get('features')[0]);
    }

    // If all features share the same coordinates and zoom is high, spiderfy
    if (
      size > 1 &&
      zoom >= 15 && // set your desired zoom threshold
      features.every(
        (f: any) =>
          f.getGeometry().getCoordinates().toString() ===
          features[0].getGeometry().getCoordinates().toString(),
      )
    ) {
      const center = features[0].getGeometry().getCoordinates();
      const positions = getSpiderfyPositions(center, size, 20); // 20 is the offset radius

      // Move features and create icon styles
      features.map((f: any, i: number) => {
        f.getGeometry().setCoordinates(positions[i]);
        return createRecreationIconStyle(filteredIds)(f);
      });
    }

    return new Style({
      image: new CircleStyle({
        radius: 18,
        stroke: new Stroke({
          color: '#fff',
          width: 2,
        }),
        fill: new Fill({
          color: '#1976d2',
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: new Fill({
          color: '#fff',
        }),
        stroke: new Stroke({
          color: '#333',
          width: 2,
        }),
        font: 'bold 16px sans-serif',
      }),
    });
  };

  useEffect(() => {
    iconLayerRef.current.setStyle(clusterStyle);
  }, [filteredIds]);

  // Zoom in one level when a cluster is clicked
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (evt: any) => {
      map.forEachFeatureAtPixel(evt.pixel, (feature: FeatureLike) => {
        const features = feature.get('features');
        if (features && features.length > 1) {
          // Cluster: zoom in to cluster center, one level closer
          const extent = feature.getGeometry()?.getExtent() || [];
          const center = getCenter(extent);
          const view = map.getView();
          const currentZoom = view.getZoom() ?? 8;
          view.animate({
            center,
            zoom: currentZoom + 1,
            duration: 300,
          });
          return true; // Stop after first cluster found
        }
        return false;
      });
    };

    map.on('click', handleClick);
    return () => {
      map.un('click', handleClick);
    };
  }, []);

  const layers = useMemo(
    () => [
      {
        id: 'recreation-icons',
        layerInstance: iconLayerRef.current,
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
        ref={mapRef}
      />

      <div className="search-map-view-controls">
        <SearchViewControls />
      </div>
    </div>
  );
};

export default SearchMap;
