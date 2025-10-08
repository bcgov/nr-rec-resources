import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadGPX,
  downloadKML,
} from '@shared/components/recreation-resource-map/helpers/mapDownloadHandlers';
import { GPX, KML } from 'ol/format';

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

// Polyfill URL methods for jsdom
if (!URL.createObjectURL) {
  URL.createObjectURL = vi.fn(() => 'blob-url') as any;
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = vi.fn() as any;
}
const mockCreateObjectURL = vi.mocked(URL.createObjectURL);

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
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });
});

describe('downloadKML', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const recResource = {
    name: 'ResourceName',
  } as any;

  it('should generate KML data for non-point geometries', () => {
    const feature = createFakeFeature('LineString');
    downloadKML([feature], recResource);
    expect(KML).toHaveBeenCalled();
    expect((KML as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });

  it('should generate KML data for point geometries', () => {
    const feature = createFakeFeature('Point');
    downloadKML([feature], recResource);
    expect(KML).toHaveBeenCalled();
    expect((KML as any).mock.results[0].value.writeFeatures).toHaveBeenCalled();
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
  });
});
