import { GPX, KML } from 'ol/format';
import { Feature } from 'ol';
import { Icon, Style } from 'ol/style';
import {
  MAP_PROJECTION_WEB_MERCATOR,
  MAP_PROJECTION_WGS84,
} from '@/components/rec-resource/RecreationResourceMap/constants';
import { triggerFileDownload } from '@/utils/fileUtils';

// Import raw SVG content for KML export
import locationDotSVGRaw from '@/images/icons/location-dot-bc-color-blue-med.svg?raw';

export function downloadGPX(features: Feature[], fileName: string) {
  const gpxFormat = new GPX();
  const gpxXml = gpxFormat.writeFeatures(features, {
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    dataProjection: MAP_PROJECTION_WGS84,
  });
  triggerFileDownload(gpxXml, `${fileName}.gpx`, 'application/gpx+xml');
}

export function downloadKML(features: Feature[], fileName: string) {
  // Clone features so original styles are not mutated
  const clonedFeatures = features.map((feature) => feature.clone());

  clonedFeatures.forEach((feature) => {
    const geometry = feature.getGeometry();

    // For point geometries, use base64-encoded SVG icon
    if (geometry?.getType() === 'Point') {
      feature.setStyle(
        new Style({
          image: new Icon({
            src: `data:image/svg+xml;base64,${btoa(locationDotSVGRaw)}`,
            scale: 0.5,
          }),
        }),
      );
    }
  });

  const kmlFormat = new KML({
    extractStyles: true,
    writeStyles: true,
  });
  const kmlXml = kmlFormat.writeFeatures(clonedFeatures, {
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    dataProjection: MAP_PROJECTION_WGS84,
  });
  triggerFileDownload(
    kmlXml,
    `${fileName}.kml`,
    'application/vnd.google-earth.kml+xml',
  );
}
