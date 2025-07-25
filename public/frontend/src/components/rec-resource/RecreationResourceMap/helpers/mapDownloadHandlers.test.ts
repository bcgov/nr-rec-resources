import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadGPX, downloadKML } from './mapDownloadHandlers';
import { GPX, KML } from 'ol/format';
import { triggerFileDownload } from '@/utils/fileUtils';

// Mock ol/format and ol/style modules
vi.mock('ol/format', () => {
  return {
    GPX: vi.fn().mockImplementation(() => ({
      writeFeatures: vi.fn().mockReturnValue('mockedGPX'),
    })),
    KML: vi.fn().mockImplementation(() => ({
      writeFeatures: vi.fn().mockReturnValue('mockedKML'),
    })),
  };
});
vi.mock('ol/style', () => {
  return {
    Icon: vi.fn(),
    Style: vi.fn(),
    Fill: vi.fn(),
    Stroke: vi.fn(),
  };
});

// Mock triggerFileDownload utility
vi.mock('@/utils/fileUtils', () => ({
  triggerFileDownload: vi.fn(),
}));

// Mock RecResourceHTMLExportDescription and renderToString for KML
vi.mock('react-dom/server', () => ({
  renderToString: vi.fn(() => '<div>desc</div>'),
}));
vi.mock(
  '@/components/rec-resource/RecreationResourceMap/RecResourceHTMLExportDescription',
  () => ({
    RecResourceHTMLExportDescription: () => null,
  }),
);

// Fallback for URL.createObjectURL in test envs
if (!URL.createObjectURL) {
  URL.createObjectURL = () => 'blob-url';
}

// Helper to create a fake Feature with proper typing
function createFakeFeature(geometryType: string) {
  return {
    clone: vi.fn(function () {
      // @ts-ignore
      return this;
    }),
    getGeometry: vi.fn(() => ({
      getType: () => geometryType,
    })),
    setStyle: vi.fn(),
    set: vi.fn(),
  } as any;
}

describe('downloadGPX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate GPX data and trigger download', () => {
    const feature = createFakeFeature('Point');
    downloadGPX([feature], 'testName');
    expect(GPX).toHaveBeenCalled();
    expect((GPX as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(triggerFileDownload).toHaveBeenCalledWith(
      'mockedGPX',
      'testName.gpx',
      'application/gpx+xml',
    );
  });
});

describe('downloadKML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const recResource = {
    name: 'ResourceName',
  } as any;

  it('should generate KML data for non-point geometries without setting style', () => {
    const feature = createFakeFeature('LineString');
    downloadKML([feature], recResource);
    expect(feature.setStyle).not.toHaveBeenCalled();
    expect(KML).toHaveBeenCalled();
    expect((KML as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(triggerFileDownload).toHaveBeenCalledWith(
      'mockedKML',
      'ResourceName.kml',
      'application/vnd.google-earth.kml+xml',
    );
  });

  it('should generate KML data for point geometries and set style', () => {
    const feature = createFakeFeature('Point');
    downloadKML([feature], recResource);
    expect(KML).toHaveBeenCalled();
    expect((KML as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(triggerFileDownload).toHaveBeenCalledWith(
      'mockedKML',
      'ResourceName.kml',
      'application/vnd.google-earth.kml+xml',
    );
  });
});
