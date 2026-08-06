import { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './MapLayersPanel.scss';

export interface LegendItem {
  colour: string;
  label: string;
}

export interface LayerToggleConfig {
  id: string;
  label: string;
  legendColour?: string;
  legendHatch?: boolean;
  legendOutlineColour?: string;
  legendItems?: LegendItem[];
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

type LayerSwatchProps =
  | { variant: 'hatch' }
  | { variant: 'outline'; colour: string }
  | { variant: 'colour'; colour?: string }
  | { variant: 'multi' };

const LayerSwatch = (props: LayerSwatchProps) => {
  const svgClass = 'map-layers-panel__swatch map-layers-panel__swatch--svg';

  if (props.variant === 'hatch') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={svgClass}
        style={{ flexShrink: 0 }}
      >
        <defs>
          <pattern
            id="hatch-legend"
            patternUnits="userSpaceOnUse"
            width="4"
            height="4"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="4"
              stroke="black"
              strokeWidth="1.5"
              strokeOpacity="1"
            />
          </pattern>
        </defs>
        <rect width="16" height="16" fill="url(#hatch-legend)" rx="2" />
        <rect
          width="16"
          height="16"
          fill="none"
          stroke="rgba(0,0,0,0.9)"
          strokeWidth="1"
          rx="2"
        />
      </svg>
    );
  }

  if (props.variant === 'outline') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={svgClass}
        style={{ flexShrink: 0 }}
      >
        <rect
          x="1"
          y="1"
          width="14"
          height="14"
          fill="none"
          stroke={props.colour}
          strokeWidth="2.5"
          rx="2"
        />
      </svg>
    );
  }

  // 'colour' and 'multi' both render a plain span
  return (
    <span
      className={`map-layers-panel__swatch${props.variant === 'multi' ? ' map-layers-panel__swatch--multi' : ''}`}
      style={
        props.variant === 'colour'
          ? { backgroundColor: props.colour }
          : undefined
      }
      aria-hidden="true"
    />
  );
};

interface MapLayersPanelProps {
  layers: LayerToggleConfig[];
}

const MapLayersPanel = ({ layers }: MapLayersPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="map-layers-panel" ref={panelRef}>
      <Button
        variant="secondary"
        className="map-layers-btn search-chip"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle map layers panel"
      >
        <FontAwesomeIcon icon={faLayerGroup} className="me-2" />
        Layers
      </Button>
      {isOpen && (
        <div className="map-layers-panel__dropdown" role="menu">
          <ul className="map-layers-panel__list">
            {layers.map((layer) => (
              <li
                key={layer.id}
                className={`map-layers-panel__item${layer.legendItems ? ' map-layers-panel__item--has-legend' : ''}`}
              >
                <div className="map-layers-panel__item-row">
                  <label
                    htmlFor={`layer-toggle-${layer.id}`}
                    className="map-layers-panel__label"
                  >
                    {layer.legendItems ? (
                      <LayerSwatch variant="multi" />
                    ) : layer.legendHatch ? (
                      <LayerSwatch variant="hatch" />
                    ) : layer.legendOutlineColour ? (
                      <LayerSwatch
                        variant="outline"
                        colour={layer.legendOutlineColour}
                      />
                    ) : (
                      <LayerSwatch
                        variant="colour"
                        colour={layer.legendColour}
                      />
                    )}
                    {layer.label}
                  </label>
                  <input
                    id={`layer-toggle-${layer.id}`}
                    type="checkbox"
                    checked={layer.enabled}
                    onChange={(e) => layer.onToggle(e.target.checked)}
                    className="map-layers-panel__checkbox"
                    role="switch"
                    aria-checked={layer.enabled}
                  />
                </div>
                {layer.legendItems && (
                  <ul className="map-layers-panel__legend-list">
                    {layer.legendItems.map((item) => (
                      <li
                        key={item.label}
                        className="map-layers-panel__legend-item"
                      >
                        <LayerSwatch variant="colour" colour={item.colour} />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapLayersPanel;
