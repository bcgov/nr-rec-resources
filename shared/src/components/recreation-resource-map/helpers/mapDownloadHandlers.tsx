import { GPX, KML } from 'ol/format';
import { Feature } from 'ol';
import {
  MAP_PROJECTION_WEB_MERCATOR,
  MAP_PROJECTION_WGS84,
} from '@shared/components/recreation-resource-map/constants';
import { RecreationResourceMapData } from '@shared/components/recreation-resource-map/RecreationResourceMap';
import { RecResourceHTMLExportDescription } from '@shared/components/recreation-resource-map/RecResourceHTMLExportDescription';
import { renderToString } from 'react-dom/server';
import { triggerFileDownload } from '@shared/utils';
import { getMapFeaturesFromRecResource } from './getMapFeaturesFromRecResource';
import { Geometry } from 'ol/geom';

interface KmlProps {
  features: Feature[];
  recResource: RecreationResourceMapData;
  getResourceDetailUrl?: (recResourceId: string) => string;
}

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
 * @param recResource RecreationResourceMapData for context and description
 * @param getResourceDetailUrl Optional callback to get the resource detail URL
 */
export function downloadKML(
  features: Feature[],
  recResource: RecreationResourceMapData,
  getResourceDetailUrl?: (recResourceId: string) => string,
) {
  features.forEach((feature) => {
    // Add HTML description for KML export
    feature.set(
      'description',
      renderToString(
        <RecResourceHTMLExportDescription
          recResource={recResource}
          getResourceDetailUrl={getResourceDetailUrl}
        />,
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

/**
 * Downloads multiple resources features as a KML file, with styles and HTML description.
 * @param props Array of Resource features props
 */
export function downloadKMLMultiple(props: KmlProps[]) {
  const allFeatures: Feature<Geometry>[] = [];
  props.forEach((p: any) => {
    p.features.forEach((feature: any) => {
      // Add HTML description for KML export
      feature.set(
        'description',
        renderToString(
          <RecResourceHTMLExportDescription
            recResource={p.recResource}
            getResourceDetailUrl={p.getResourceDetailUrl}
          />,
        ),
      );
      allFeatures.push(feature);
    });
  });
  const kmlFormat = new KML({
    extractStyles: true,
    writeStyles: true,
  });
  const kmlXml = kmlFormat.writeFeatures(allFeatures, {
    featureProjection: MAP_PROJECTION_WEB_MERCATOR,
    dataProjection: MAP_PROJECTION_WGS84,
  });
  triggerFileDownload(
    kmlXml,
    `search_results.kml`,
    'application/vnd.google-earth.kml+xml',
  );
}
