import { describe, it, expect } from 'vitest';
import {
  buildImapUrl,
  buildImapUrlFromLatLng,
  buildImapUrlFromUtm,
} from '@/utils/imap';

const IMAP_BASE = 'https://maps.gov.bc.ca/ess/hm/imap4m/';

describe('buildImapUrl', () => {
  it('builds URL with x, y and default WKID (WGS84)', () => {
    const url = buildImapUrl(-123.654321, 49.123456);
    expect(url).toContain(IMAP_BASE);
    expect(url).toContain('center=-123.654321%2C49.123456%2C4326');
    expect(url).not.toContain('scale=');
  });

  it('includes scale when provided', () => {
    const url = buildImapUrl(-123.0, 49.0, 4326, 20000);
    expect(url).toContain('scale=20000');
  });

  it('builds URL with custom WKID', () => {
    const url = buildImapUrl(500000, 5480000, 26910);
    expect(url).toContain('center=500000%2C5480000%2C26910');
  });

  it('does not include scale when scale is undefined', () => {
    const url = buildImapUrl(0, 0, 4326, undefined);
    expect(url).not.toContain('scale=');
  });
});

describe('buildImapUrlFromLatLng', () => {
  it('builds URL using longitude as x and latitude as y', () => {
    const url = buildImapUrlFromLatLng(49.123456, -123.654321);
    expect(url).toContain('center=-123.654321%2C49.123456%2C4326');
  });

  it('includes default scale of 10000', () => {
    const url = buildImapUrlFromLatLng(49.0, -123.0);
    expect(url).toContain('scale=10000');
  });

  it('allows custom scale override', () => {
    const url = buildImapUrlFromLatLng(49.0, -123.0, 5000);
    expect(url).toContain('scale=5000');
  });
});

describe('buildImapUrlFromUtm', () => {
  it('builds URL from UTM coordinates with correct WKID for zone 10', () => {
    const url = buildImapUrlFromUtm(500000, 5480000, 10);
    // zone 10 → WKID 26910
    expect(url).toContain('center=500000%2C5480000%2C26910');
  });

  it('builds URL from UTM coordinates with correct WKID for zone 11', () => {
    const url = buildImapUrlFromUtm(400000, 5600000, 11);
    // zone 11 → WKID 26911
    expect(url).toContain('center=400000%2C5600000%2C26911');
  });

  it('includes default scale of 10000', () => {
    const url = buildImapUrlFromUtm(500000, 5480000, 10);
    expect(url).toContain('scale=10000');
  });

  it('allows custom scale override', () => {
    const url = buildImapUrlFromUtm(500000, 5480000, 10, 25000);
    expect(url).toContain('scale=25000');
  });

  it('truncates non-integer zone (e.g. 10.9 → zone 10)', () => {
    const urlTruncated = buildImapUrlFromUtm(500000, 5480000, 10);
    const urlFloat = buildImapUrlFromUtm(500000, 5480000, 10.9 as number);
    expect(urlTruncated).toBe(urlFloat);
  });
});
