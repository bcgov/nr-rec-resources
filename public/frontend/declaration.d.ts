/// <reference types="vitest/globals" />
declare module '*.module.css';
declare module 'happo-playwright';
declare module 'happo.io';
declare module 'ol-ext/layer/AnimatedCluster';
declare global {
  interface Window {
    _paq?: Array<string | any[]>;
  }
}
declare module '*.svg' {
  const content: string;
  export default content;
}
