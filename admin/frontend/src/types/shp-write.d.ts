declare module '@mapbox/shp-write' {
  type ZipArchiveLike = {
    generateAsync?: (options: { type: 'blob' }) => Promise<Blob>;
  };
  interface ShpWriteOptions {
    folder?: string;
    prj?: string;
    types?: Partial<{
      point: string;
      polygon: string;
      polyline: string;
    }>;
  }

  type ZipResult =
    | string
    | Blob
    | ArrayBuffer
    | Uint8Array
    | ZipArchiveLike
    | Promise<string | Blob | ArrayBuffer | Uint8Array | ZipArchiveLike>;

  const shpWrite: {
    download: (featureCollection: any, options?: ShpWriteOptions) => void;
    zip: (featureCollection: any, options?: ShpWriteOptions) => ZipResult;
  };

  export default shpWrite;
}
