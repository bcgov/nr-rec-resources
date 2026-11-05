import { describe, expect, it } from 'vitest';
import {
  buildDownloadFileName,
  slugifyFileNamePart,
} from '@shared/utils/downloadFileName';

describe('slugifyFileNamePart', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(slugifyFileNamePart('Lake View')).toBe('lake-view');
  });

  it('drops unsafe characters and collapses dashes', () => {
    expect(slugifyFileNamePart(' Trail map / (v2)!  ')).toBe('trail-map-v2');
  });

  it('strips accents', () => {
    expect(slugifyFileNamePart('Café Élan')).toBe('cafe-elan');
  });

  it('keeps underscores', () => {
    expect(slugifyFileNamePart('rec_resources')).toBe('rec_resources');
  });
});

describe('buildDownloadFileName', () => {
  it('builds an image name', () => {
    expect(
      buildDownloadFileName({
        kind: 'images',
        recResourceId: 'REC1234',
        parts: ['Lake View'],
        extension: 'webp',
      }),
    ).toBe('images.sitesandtrailsbc.REC1234.lake-view.webp');
  });

  it('builds a doc name with a type part', () => {
    expect(
      buildDownloadFileName({
        kind: 'docs',
        recResourceId: 'REC1234',
        parts: ['consent', 'Lake View'],
        extension: 'pdf',
      }),
    ).toBe('docs.sitesandtrailsbc.REC1234.consent.lake-view.pdf');
  });

  it('builds a name without a rec resource id', () => {
    expect(
      buildDownloadFileName({
        kind: 'exports',
        parts: ['rec_resources', '2026-11-05'],
        extension: 'csv',
      }),
    ).toBe('exports.sitesandtrailsbc.rec_resources.2026-11-05.csv');
  });

  it('removes a duplicate extension from a part', () => {
    expect(
      buildDownloadFileName({
        kind: 'docs',
        recResourceId: 'REC1234',
        parts: ['Order.PDF'],
        extension: '.pdf',
      }),
    ).toBe('docs.sitesandtrailsbc.REC1234.order.pdf');
  });

  it('skips empty parts', () => {
    expect(
      buildDownloadFileName({
        kind: 'images',
        recResourceId: undefined,
        parts: [null, '', '!!!'],
        extension: 'webp',
      }),
    ).toBe('images.sitesandtrailsbc.webp');
  });
});
