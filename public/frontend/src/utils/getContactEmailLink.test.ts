import { describe, expect, it } from 'vitest';
import { getContactEmailLink } from './getContactEmailLink';

describe('getContactEmailLink', () => {
  it('returns mailto link with subject only when no rec_resource is provided', () => {
    const link = getContactEmailLink();
    expect(link).toBe(
      'mailto:recinfo@gov.bc.ca?subject=Recreation%20Sites%20and%20Trails%20BC%20-%20Contact%20Us%20Message',
    );
  });

  it('returns mailto link with subject and body when rec_resource is provided', () => {
    const rec_resource = {
      name: 'Test Site',
      rec_resource_id: '123',
      recreation_district: { description: 'Test District' },
      closest_community: 'Testville',
    } as any;

    const link = getContactEmailLink(rec_resource);

    expect(link).toContain('mailto:recinfo@gov.bc.ca?subject=');
    expect(link).toContain('body=');
    expect(decodeURIComponent(link)).toContain('Location: Test Site - 123');
    expect(decodeURIComponent(link)).toContain('District: Test District');
    expect(decodeURIComponent(link)).toContain('Closest Community: Testville');
    expect(decodeURIComponent(link)).toContain('Full Name: [Your Name]');
  });

  it('handles missing optional fields gracefully', () => {
    const rec_resource = {
      name: 'Test Site',
      rec_resource_id: '456',
      // recreation_district and closest_community are undefined
    } as any;

    const link = getContactEmailLink(rec_resource);

    expect(decodeURIComponent(link)).toContain('Location: Test Site - 456');
    expect(decodeURIComponent(link)).not.toContain('District:');
  });

  it('does not include District if description is empty string', () => {
    const rec_resource = {
      name: 'Test Site',
      rec_resource_id: '789',
      recreation_district: { description: '' },
      closest_community: 'Testville',
    } as any;

    const link = getContactEmailLink(rec_resource);

    expect(decodeURIComponent(link)).not.toContain('District:');
    expect(decodeURIComponent(link)).toContain('Closest Community: Testville');
  });
});
