import { GPX, KML } from 'ol/format';
import { Feature } from 'ol';
import {
  MAP_PROJECTION_WEB_MERCATOR,
  MAP_PROJECTION_WGS84,
} from '@/components/rec-resource/RecreationResourceMap/constants';
import { triggerFileDownload } from '@/utils/fileUtils';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { RecResourceHTMLExportDescription } from '@/components/rec-resource/RecreationResourceMap/RecResourceHTMLExportDescription';
import { renderToString } from 'react-dom/server';

/**
 * Downloads features as a GPX file.
 * @param features Array of OpenLayers Features
 * @param fileName Name for the downloaded file (without extension)
 */
export function downloadGPX(features: Feature[], fileName: string) {
  const gpxFormat = new GPX();
  const gpxXml = gpxFormat.writeFeatures(features, {
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    dataProjection: MAP_PROJECTION_WGS84,
  });
  triggerFileDownload(gpxXml, `${fileName}.gpx`, 'application/gpx+xml');
}

/**
 * Downloads features as a KML file, with styles and HTML description.
 * @param features Array of OpenLayers Features
 * @param recResource RecreationResourceDetailModel for context and description
 */
export function downloadKML(
  features: Feature[],
  recResource: RecreationResourceDetailModel,
) {
  features.forEach((feature) => {
    // Add HTML description for KML export
    feature.set(
      'description',
      renderToString(
        <RecResourceHTMLExportDescription recResource={recResource} />,
      ),
    );
  });

  const kmlFormat = new KML({
    extractStyles: true,
    writeStyles: true,
  });
  const kmlXml = kmlFormat.writeFeatures(features, {
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    dataProjection: MAP_PROJECTION_WGS84,
  });
  triggerFileDownload(
    kmlXml,
    `${recResource.name}.kml`,
    'application/vnd.google-earth.kml+xml',
  );
}
