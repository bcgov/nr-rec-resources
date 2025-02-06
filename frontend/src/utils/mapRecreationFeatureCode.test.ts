import { mapRecreationFeatureCode } from './mapRecreationFeatureCode';

describe('mapRecreationFeatureCode', () => {
  it('should return correct description for known codes', () => {
    expect(mapRecreationFeatureCode('RTR')).toBe('Recreation Trail');
    expect(mapRecreationFeatureCode('SIT')).toBe('Recreation Site');
    expect(mapRecreationFeatureCode('RR')).toBe('Recreation Reserve');
    expect(mapRecreationFeatureCode('IF')).toBe('Interpretive Forest');
  });

  it('should return "Unknown Feature" for unknown codes', () => {
    expect(mapRecreationFeatureCode('XYZ')).toBe('Unknown Feature');
    expect(mapRecreationFeatureCode('')).toBe('Unknown Feature');
    expect(mapRecreationFeatureCode('123')).toBe('Unknown Feature');
  });

  it('should handle case sensitivity correctly', () => {
    expect(mapRecreationFeatureCode('rtr')).toBe('Unknown Feature');
    expect(mapRecreationFeatureCode('sit')).toBe('Unknown Feature');
  });
});
