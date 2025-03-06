import { Control } from 'ol/control';

interface ZoomControlOptions {
  target?: HTMLElement | string;
}

// Create a custom zoom control class that extends OpenLayers' Control
export class ZoomControl extends Control {
  constructor(options?: ZoomControlOptions) {
    const opt = options || {};
    const element = document.createElement('div');
    element.className = 'zoom-control ol-unselectable ol-control';

    // Create zoom in button with Font Awesome plus icon
    const zoomInButton = document.createElement('button');
    zoomInButton.innerHTML = '<i class="fas fa-plus"></i>';
    element.appendChild(zoomInButton);

    // Create zoom out button with Font Awesome minus icon
    const zoomOutButton = document.createElement('button');
    zoomOutButton.innerHTML = '<i class="fas fa-minus"></i>';
    element.appendChild(zoomOutButton);

    super({
      element: element,
      target: opt.target,
    });

    // Bind event listeners for zoom in and out
    zoomInButton.addEventListener('click', this.handleZoomIn.bind(this));
    zoomOutButton.addEventListener('click', this.handleZoomOut.bind(this));
  }

  private handleZoomIn(e: MouseEvent): void {
    e.preventDefault();
    const map = this.getMap();
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) {
        view.setZoom(zoom + 1);
      }
    }
  }

  private handleZoomOut(e: MouseEvent): void {
    e.preventDefault();
    const map = this.getMap();
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom !== undefined) {
        view.setZoom(zoom - 1);
      }
    }
  }
}
