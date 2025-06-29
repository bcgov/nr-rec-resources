import {
  CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
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
import './SearchMap.scss';
import ReactDOM from 'react-dom/client';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource/recreationResourceQueries';
import { Card, Spinner, Alert } from 'react-bootstrap';
import type { RecreationResourceDetailModel } from '@/service/custom-models';
import { ThingsToDo } from '@/components/rec-resource/section';

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
  data: any;
  isLoading: boolean;
  error: any;
}

const OverlayContent: React.FC<OverlayContentProps> = ({
  data,
  isLoading,
  error,
}) => {
  if (isLoading)
    return (
      <Card
        className="overlay-content shadow-lg border-0"
        style={{ minWidth: 280, maxWidth: 350 }}
      >
        <Card.Body className="d-flex justify-content-center align-items-center py-4">
          <div className="text-center">
            <Spinner animation="border" variant="primary" size="sm" />
            <div className="mt-2 text-muted small">Loading details...</div>
          </div>
        </Card.Body>
      </Card>
    );

  if (error)
    return (
      <Card
        className="overlay-content shadow-lg border-0"
        style={{ minWidth: 280, maxWidth: 350 }}
      >
        <Card.Body className="py-3">
          <Alert variant="danger" className="mb-0 small">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Error loading details
          </Alert>
        </Card.Body>
      </Card>
    );

  if (!data)
    return (
      <Card
        className="overlay-content shadow-lg border-0"
        style={{ minWidth: 280, maxWidth: 350 }}
      >
        <Card.Body className="py-3">
          <Alert variant="warning" className="mb-0 small">
            <i className="fas fa-info-circle me-2"></i>
            No details found
          </Alert>
        </Card.Body>
      </Card>
    );

  // Use RecResourcePage field logic for overlay
  const resource = data as RecreationResourceDetailModel;

  return (
    <Card
      className="overlay-content shadow-lg border-0"
      style={{
        minWidth: 280,
        maxWidth: 350,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <Card.Header className="bg-primary text-white border-0 py-2">
        <h6 className="mb-0 fw-bold text-truncate">
          <i className="fas fa-map-marker-alt me-2"></i>
          {resource.name || 'Recreation Resource'}
        </h6>
      </Card.Header>

      <Card.Body className="py-3">
        {/* Resource Type & ID */}
        <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
          <small className="text-muted">
            <i className="fas fa-tag me-1"></i>
            {resource.rec_resource_type}
          </small>
          <small className="badge bg-secondary">
            ID: {resource.rec_resource_id}
          </small>
        </div>

        {/* Location */}
        {resource.closest_community && (
          <div className="mb-2 p-2 border-start border-primary border-3 bg-light">
            <small className="text-primary fw-semibold">
              <i className="fas fa-location-dot me-2"></i>
              {resource.closest_community}
            </small>
          </div>
        )}

        {/* Status */}
        {resource.recreation_status && (
          <div className="mb-2">
            <span
              className={`badge ${
                resource.recreation_status.status_code === 1
                  ? 'bg-success'
                  : resource.recreation_status.status_code === 2
                    ? 'bg-warning text-dark'
                    : 'bg-danger'
              }`}
            >
              <i className="fas fa-info-circle me-1"></i>
              {resource.recreation_status.description}
            </span>
          </div>
        )}

        {/* Description */}
        {resource.description && (
          <div className="mb-3">
            <div className="text-muted small mb-1">
              <i className="fas fa-info me-1"></i>
              <strong>Description:</strong>
            </div>
            <p className="small mb-0 text-dark" style={{ lineHeight: '1.4' }}>
              {resource.description.length > 120
                ? `${resource.description.substring(0, 120)}...`
                : resource.description}
            </p>
          </div>
        )}

        {/* Activities */}
        {resource.recreation_activity &&
          resource.recreation_activity.length > 0 && (
            <div className="mb-2">
              <div className="text-muted small mb-2">
                <i className="fas fa-hiking me-1"></i>
                <strong>Things To Do:</strong>
              </div>
              <div
                style={{ transform: 'scale(0.8)', transformOrigin: 'left top' }}
              >
                <ThingsToDo activities={resource.recreation_activity} />
              </div>
            </div>
          )}

        {/* Access types */}
        {resource.recreation_access &&
          resource.recreation_access.length > 0 && (
            <div className="mb-1">
              <div className="text-muted small mb-2">
                <i className="fas fa-road me-1"></i>
                <strong>Access:</strong>
              </div>
              <div className="d-flex flex-wrap gap-1">
                {resource.recreation_access.map((access: any, idx: number) => (
                  <span key={idx} className="badge bg-outline-secondary small">
                    {access.access_type}
                  </span>
                ))}
              </div>
            </div>
          )}
      </Card.Body>

      <Card.Footer className="bg-transparent border-0 pt-0 pb-2">
        <small className="text-muted">
          <i className="fas fa-mouse-pointer me-1"></i>
          Click for full details
        </small>
      </Card.Footer>
    </Card>
  );
};

// Symbol to safely store the React root on the overlay element
const OVERLAY_ROOT = Symbol('overlayReactRoot');

// Add some CSS for overlay appearance
const overlayStyle = document.createElement('style');
overlayStyle.textContent = `
  .forest-file-overlay {
    transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    transform-origin: center bottom;
    opacity: 0;
    animation: fadeIn 0.2s forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .ol-overlay-container {
    will-change: transform;
  }
  
  .overlay-content {
    max-width: 350px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
    border-radius: 8px;
    overflow: hidden;
  }
`;
document.head.appendChild(overlayStyle);

// We no longer need this function as we're now using the handleOverlayVisibility function
// to dynamically adjust positioning based on viewport constraints

// Helper function to render overlay content
const renderOverlayContent = (
  overlayElement: HTMLElement,
  data: any,
  isLoading: boolean,
  error: any,
) => {
  const content = (
    <OverlayContent data={data} isLoading={isLoading} error={error} />
  );

  if (!(OVERLAY_ROOT in overlayElement)) {
    const root = ReactDOM.createRoot(overlayElement);
    root.render(content);
    (overlayElement as any)[OVERLAY_ROOT] = root;
  } else {
    (overlayElement as any)[OVERLAY_ROOT].render(content);
  }
};

const SearchMap = ({ style }: SearchableMapProps) => {
  // Setting a list filteredIds will dynamically filter the recreation feature layer
  const [filteredIds] = useState<string[]>([]);
  // State to track the currently hovered forestFileId
  const [hoveredForestFileId, setHoveredForestFileId] = useState<
    string | undefined
  >(undefined);

  // Add a ref to store the map instance
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<Overlay | null>(null);

  // Fetch resource details for the hovered forestFileId
  const { data, isLoading, error } = useGetRecreationResourceById({
    id: hoveredForestFileId,
  });

  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    // Create overlay element
    const overlayElement = document.createElement('div');
    overlayElement.className = 'forest-file-overlay';

    // Use OpenLayers' overlay
    overlayRef.current = new Overlay({
      element: overlayElement,
      stopEvent: false,
      // autoPan: true,
    });
    mapInstance.addOverlay(overlayRef.current);

    // Create a handler to ensure overlay stays visible within map viewport
    const handleOverlayVisibility = () => {
      const currentOverlay = overlayRef.current;
      if (!currentOverlay || !currentOverlay.getPosition()) {
        return; // Overlay is hidden or not initialized, no need to adjust
      }

      const overlayRect = overlayElement.getBoundingClientRect();
      const mapViewport = mapInstance.getViewport().getBoundingClientRect();

      // Get current overlay position in map coordinates
      const position = currentOverlay.getPosition() as [number, number];
      if (!position) return;

      // Convert map position to pixel position
      const pixelPosition = mapInstance.getPixelFromCoordinate(position);
      if (!pixelPosition) return;

      // Determine quadrant of the map where point is located
      const isInLeftHalf = pixelPosition[0] < mapViewport.width / 2;
      const isInTopHalf = pixelPosition[1] < mapViewport.height / 2;

      // Calculate new positioning based on quadrant
      // This gives us an ideal positioning direction
      let idealPositioning: string;
      if (isInTopHalf && isInLeftHalf) {
        // Top-left quadrant - prefer right or below
        idealPositioning = 'top-right';
      } else if (isInTopHalf && !isInLeftHalf) {
        // Top-right quadrant - prefer left or below
        idealPositioning = 'top-left';
      } else if (!isInTopHalf && isInLeftHalf) {
        // Bottom-left quadrant - prefer right or above
        idealPositioning = 'bottom-right';
      } else {
        // Bottom-right quadrant - prefer left or above
        idealPositioning = 'bottom-left';
      }

      // Default offsets
      let offsetX = 0;
      const offsetY = 0;

      // Start with ideal positioning from the quadrant determination
      let newPositioning = idealPositioning;

      // Check for viewport boundary violations
      // First check vertical constraints
      if (overlayRect.top < mapViewport.top) {
        // Overlay goes off the top - adjust to be below the point
        newPositioning = newPositioning.replace('top', 'bottom');
      } else if (overlayRect.bottom > mapViewport.bottom) {
        // Overlay goes off the bottom - adjust to be above the point
        newPositioning = newPositioning.replace('bottom', 'top');
      }

      // Then check horizontal constraints
      if (overlayRect.left < mapViewport.left) {
        // Overlay goes off the left - try positioning to the right
        newPositioning = newPositioning.replace('left', 'right');
        // If still problematic, use center with offset
        if (overlayRect.right > mapViewport.width) {
          newPositioning = newPositioning.replace('right', 'center');
          offsetX =
            mapViewport.width / 2 - overlayRect.width / 2 - pixelPosition[0];
        }
      } else if (overlayRect.right > mapViewport.right) {
        // Overlay goes off the right - try positioning to the left
        newPositioning = newPositioning.replace('right', 'left');
        // If still problematic, use center with offset
        if (overlayRect.left < 0) {
          newPositioning = newPositioning.replace('left', 'center');
          offsetX =
            mapViewport.width / 2 - overlayRect.width / 2 - pixelPosition[0];
        }
      }

      // Calculate base offsets based on positioning
      const baseOffsetX = newPositioning.includes('left')
        ? -15
        : newPositioning.includes('right')
          ? 15
          : 0;
      const baseOffsetY = newPositioning.includes('top')
        ? -15
        : newPositioning.includes('bottom')
          ? 15
          : 0;

      // Apply adjustments
      currentOverlay.setPositioning(newPositioning as any);
      currentOverlay.setOffset([baseOffsetX + offsetX, baseOffsetY + offsetY]);

      // Optional: animate the map if the overlay is still partially offscreen
      const newRect = overlayElement.getBoundingClientRect();
      const marginNeeded = 10; // pixels of margin to ensure visibility

      if (
        newRect.left < mapViewport.left + marginNeeded ||
        newRect.right > mapViewport.right - marginNeeded ||
        newRect.top < mapViewport.top + marginNeeded ||
        newRect.bottom > mapViewport.bottom - marginNeeded
      ) {
        // Calculate how much we need to pan the map
        let panX = 0,
          panY = 0;

        if (newRect.left < mapViewport.left + marginNeeded) {
          panX = newRect.left - (mapViewport.left + marginNeeded);
        } else if (newRect.right > mapViewport.right - marginNeeded) {
          panX = newRect.right - (mapViewport.right - marginNeeded);
        }

        if (newRect.top < mapViewport.top + marginNeeded) {
          panY = newRect.top - (mapViewport.top + marginNeeded);
        } else if (newRect.bottom > mapViewport.bottom - marginNeeded) {
          panY = newRect.bottom - (mapViewport.bottom - marginNeeded);
        }

        // Only pan if needed
        if (panX !== 0 || panY !== 0) {
          const view = mapInstance.getView();
          const currentCenter = view.getCenter();
          if (currentCenter) {
            // Convert pixel pan to map coordinates
            const currentRes = view.getResolution() || 1;
            view.animate({
              center: [
                currentCenter[0] + panX * currentRes,
                currentCenter[1] - panY * currentRes, // Y is inverted in pixel space vs. map space
              ],
              duration: 200,
            });
          }
        }
      }
    };

    // Attach listener to map moveend and change events
    mapInstance.on('moveend', handleOverlayVisibility);
    mapInstance.on('change:size', handleOverlayVisibility);

    // Also handle when user resizes the window
    window.addEventListener('resize', handleOverlayVisibility);

    return () => {
      mapInstance?.removeOverlay(overlayRef.current!);
      mapInstance.un('moveend', handleOverlayVisibility);
      mapInstance.un('change:size', handleOverlayVisibility);
      window.removeEventListener('resize', handleOverlayVisibility);
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

  const clusterStyle = useCallback(
    (feature: any) => {
      const size = feature.get('features')?.length || 1;
      const features = feature.get('features');
      const view = mapRef.current?.getView();
      const zoom = view?.getZoom() ?? 8;

      if (size === 1) {
        // Single feature, use the existing icon style
        return createRecreationIconStyle(filteredIds)(
          feature.get('features')[0],
        );
      }

      // If all features share the same coordinates and zoom is high, spiderfy
      if (
        size > 1 &&
        zoom >= 8 &&
        features.every(
          (f: any) =>
            f.getGeometry().getCoordinates().toString() ===
            features[0].getGeometry().getCoordinates().toString(),
        )
      ) {
        const center = features[0].getGeometry().getCoordinates();
        const positions = getSpiderfyPositions(center, size, 50); // 20 is the offset radius

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
    },
    [filteredIds],
  );

  useEffect(() => {
    iconLayerRef.current.setStyle(clusterStyle);
  }, [filteredIds, clusterStyle]);

  // Zoom in one level when a cluster is clicked
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handlePointerMove = (evt: any) => {
      let foundFeature = false;
      map.forEachFeatureAtPixel(evt.pixel, (feature: FeatureLike) => {
        const features = feature.get('features');
        if (features && features.length >= 1) {
          if (features && features.length === 1) {
            // Single feature: show overlay with details
            foundFeature = true;
            const forestFileId = features[0].get('FOREST_FILE_ID');
            setHoveredForestFileId(forestFileId); // update state
            const coordinate = features[0].getGeometry().getCoordinates();

            // Get map and overlay elements
            const pixel = map.getPixelFromCoordinate(coordinate);
            const mapSize = map.getSize() ?? [0, 0];
            const overlayElement = overlayRef.current!.getElement()!;

            // Render the overlay content
            renderOverlayContent(overlayElement, data, isLoading, error);

            // Simply set the position - our handleOverlayVisibility will take care of positioning
            overlayRef.current!.setPosition(coordinate);

            // Let's set an initial positioning based on position on screen
            const isTopHalf = pixel[1] < mapSize[1] / 2;
            overlayRef.current!.setPositioning(
              isTopHalf ? 'top-center' : 'bottom-center',
            );
            overlayRef.current!.setOffset([0, isTopHalf ? 15 : -15]);

            return true; // Stop after first feature found
          }
          return false;
        }
      });
      if (!foundFeature) {
        overlayRef.current!.setPosition(undefined);
        setHoveredForestFileId(undefined); // clear state
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
  }, [data, isLoading, error]);

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
