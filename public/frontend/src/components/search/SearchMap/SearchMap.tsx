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
import { Overlay } from 'ol';
import { renderToString } from 'react-dom/server';
import './SearchMap.scss';

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

interface OverlayContentProps {
  forestFileId: string;
  projectName?: string;
}

const OverlayContent: React.FC<OverlayContentProps> = ({
  forestFileId,
  projectName,
}) => {
  return (
    <div className="overlay-content">
      <h3>Forest File ID:</h3>
      <p>{forestFileId}</p>
      {projectName && (
        <>
          <h3>Project Name:</h3>
          <p>{projectName}</p>
        </>
      )}
    </div>
  );
};

const SearchMap = ({ style }: SearchableMapProps) => {
  // Setting a list filteredIds will dynamically filter the recreation feature layer
  const [filteredIds] = useState<string[]>([]);

  // Add a ref to store the map instance
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create overlay element
    const overlayElement = document.createElement('div');
    overlayElement.className = 'forest-file-overlay';
    overlayRef.current = new Overlay({
      element: overlayElement,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -20],
    });
    mapRef.current.addOverlay(overlayRef.current);

    return () => {
      mapRef.current?.removeOverlay(overlayRef.current!);
    };
  }, []);

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

    const handlePointerMove = (evt: any) => {
      let foundFeature = false;
      map.forEachFeatureAtPixel(evt.pixel, (feature: FeatureLike) => {
        const features = feature.get('features');
        if (features && features.length >= 1) {
          // Cluster: zoom in to cluster center, one level closer
          const extent = feature.getGeometry()?.getExtent() || [];
          const center = getCenter(extent);
          const view = map.getView();
          const currentZoom = view.getZoom() ?? 8;

          if (features && features.length === 1) {
            // Single feature: show overlay with details
            foundFeature = true;
            const forestFileId = features[0].get('FOREST_FILE_ID');
            const projectName = features[0].get('PROJECT_NAME');
            const coordinate = features[0].getGeometry().getCoordinates();

            // Calculate overlay position
            const pixel = map.getPixelFromCoordinate(coordinate);
            const mapSize = map.getSize();
            const overlayElement = overlayRef.current!.getElement()!;

            // Render the overlay content to measure its size
            overlayElement.innerHTML = renderToString(
              <OverlayContent
                forestFileId={forestFileId}
                projectName={projectName}
              />,
            );

            // Get overlay size after rendering
            const overlayWidth = overlayElement.offsetWidth;
            const overlayHeight = overlayElement.offsetHeight;

            let offsetX = 0;
            let offsetY = -20; // Default offset

            // Check if overlay goes beyond the right edge
            if (pixel[0] + overlayWidth / 2 > mapSize[0]) {
              offsetX = mapSize[0] - (pixel[0] + overlayWidth / 2);
            }
            // Check if overlay goes beyond the left edge
            if (pixel[0] - overlayWidth / 2 < 0) {
              offsetX = -(pixel[0] - overlayWidth / 2);
            }
            // Check if overlay goes beyond the bottom edge
            if (pixel[1] + overlayHeight > mapSize[1]) {
              offsetY = overlayHeight + 20;
            }

            overlayRef.current!.setPosition(coordinate);
            overlayRef.current!.setOffset([offsetX, offsetY]);

            return true; // Stop after first feature found
          }
          return false;
        }
      });
      if (!foundFeature) {
        overlayRef.current!.setPosition(undefined);
      }
    };

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
            center: center,
            zoom: currentZoom + 1,
            duration: 250,
          });
          return true; // Stop after first feature found
        }
        return false;
      });
    };

    map.on('pointermove', handlePointerMove);
    map.on('click', handleClick);
    return () => {
      map.un('pointermove', handlePointerMove);
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
