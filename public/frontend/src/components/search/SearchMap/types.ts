import { Options as ClusterOptions } from 'ol/source/Cluster';

export interface AnimatedClusterOptions {
  animationDuration?: number;
  declutter?: boolean;
  updateWhileInteracting?: boolean;
  updateWhileAnimating?: boolean;
  renderBuffer?: number;
}

export interface ExtendedClusterOptions extends ClusterOptions {
  /* Zoom threshold for clustering -
   * clusters will be created only if the zoom level is below this value (distance is set to 0) */
  clusterZoomThreshold?: number;
}
