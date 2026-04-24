declare module 'keycloak-js' {
  import Keycloak from 'keycloak-js/lib/keycloak';

  export default Keycloak;
}

declare module 'libheif-js/wasm-bundle' {
  interface HeifImage {
    get_width(): number;
    get_height(): number;
    display(
      imageData: ImageData,
      callback: (displayData: ImageData | null) => void,
    ): void;
  }

  interface HeifDecoderInstance {
    decode(data: Uint8Array): HeifImage[];
  }

  interface LibHeif {
    HeifDecoder: new () => HeifDecoderInstance;
  }

  const libheif: LibHeif;
  export default libheif;
}
