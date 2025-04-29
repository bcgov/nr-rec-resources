export {};
declare module '*.module.css';
declare module 'happo-playwright';
declare module 'happo.io';
declare global {
  interface Window {
    _paq?: Array<string | any[]>;
  }
}
