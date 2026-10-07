declare module 'shpjs' {
  export default function shp(
    data: ArrayBuffer | Uint8Array | string,
  ): Promise<any>;
}
