import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadGPX,
  downloadKML,
  downloadKMLMultiple,
} from '@shared/components/recreation-resource-map/helpers/mapDownloadHandlers';
import { GPX, KML } from 'ol/format';

vi.mock('ol/format', () => {
  return {
    GPX: vi.fn().mockImplementation(function () {
      return {
        writeFeatures: vi.fn().mockReturnValue('mockedGPX'),
      };
    }),
    KML: vi.fn().mockImplementation(function () {
      return {
        writeFeatures: vi.fn().mockReturnValue('mockedKML'),
      };
    }),
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

vi.mock('react-dom/server', () => ({
  renderToString: vi.fn(() => '<div>desc</div>'),
}));
vi.mock(
  '@shared/components/recreation-resource-map/RecResourceHTMLExportDescription',
  () => ({
    RecResourceHTMLExportDescription: () => null,
  }),
);

const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

const mockCreateObjectURL = vi
  .spyOn(URL, 'createObjectURL')
  .mockReturnValue('blob-url');
const mockRevokeObjectURL = vi
  .spyOn(URL, 'revokeObjectURL')
  .mockImplementation(() => {});

const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: mockClick,
    } as any;
  }
  return originalCreateElement(tagName);
});

vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

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
    downloadGPX([feature], {
      rec_resource_id: 'REC1234',
      name: 'Lake Trail',
    } as any);

    expect(GPX).toHaveBeenCalled();
    expect((GPX as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
    expect(mockAppendChild.mock.calls[0][0].download).toBe(
      'maps.sitesandtrailsbc.REC1234.lake-trail.gpx',
    );
  });
});

describe('downloadKML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const recResource = {
    rec_resource_id: 'REC1234',
    name: 'Resource Name',
  } as any;

  it('names the file with the maps prefix', () => {
    downloadKML([createFakeFeature('Point')], recResource);

    expect(mockAppendChild.mock.calls[0][0].download).toBe(
      'maps.sitesandtrailsbc.REC1234.resource-name.kml',
    );
  });

  it('names search results with the maps prefix', () => {
    downloadKMLMultiple([
      { features: [createFakeFeature('Point')], recResource },
    ]);

    expect(mockAppendChild.mock.calls[0][0].download).toBe(
      'maps.sitesandtrailsbc.search-results.kml',
    );
  });

  it('should generate KML data for non-point geometries', () => {
    const feature = createFakeFeature('LineString');
    downloadKML([feature], recResource);

    expect(KML).toHaveBeenCalled();
    expect((KML as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should generate KML data for point geometries', () => {
    const feature = createFakeFeature('Point');
    downloadKML([feature], recResource);

    expect(KML).toHaveBeenCalled();
    expect((KML as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });
});
