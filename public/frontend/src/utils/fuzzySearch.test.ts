import { describe, it, expect } from 'vitest';
import { fuzzySearchCities, fuzzySearchBestCity } from './fuzzySearch';
import { City } from '@/components/recreation-suggestion-form/types';
import { OPTION_TYPE } from '@/components/recreation-suggestion-form/constants';

describe('fuzzySearch', () => {
  const mockCities: City[] = [
    {
      id: 1,
      name: 'Vancouver',
      latitude: 49.2827,
      longitude: -123.1207,
      rank: 1,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 2,
      name: 'Victoria',
      latitude: 48.4284,
      longitude: -123.3656,
      rank: 2,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 3,
      name: 'Kamloops',
      latitude: 50.6745,
      longitude: -120.3273,
      rank: 3,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 4,
      name: 'New Westminster',
      latitude: 49.2057,
      longitude: -122.911,
      rank: 4,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 5,
      name: 'Port Coquitlam',
      latitude: 49.2624,
      longitude: -122.7811,
      rank: 5,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 6,
      name: 'Fort St. John',
      latitude: 56.2465,
      longitude: -120.8476,
      rank: 6,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 7,
      name: 'Welcome Beach',
      latitude: 49.1234,
      longitude: -123.5678,
      rank: 7,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 8,
      name: 'Britannia Beach',
      latitude: 49.2345,
      longitude: -123.6789,
      rank: 8,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 9,
      name: 'Beach',
      latitude: 49.3456,
      longitude: -123.789,
      rank: 9,
      option_type: OPTION_TYPE.CITY,
    },
    {
      id: 10,
      name: 'Ainsworth Hot Springs',
      latitude: 49.4567,
      longitude: -123.8901,
      rank: 10,
      option_type: OPTION_TYPE.CITY,
    },
  ];

  describe('fuzzySearchCities', () => {
    it('should find exact matches', () => {
      const results = fuzzySearchCities(mockCities, 'Vancouver');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Vancouver');
    });

    it('should find partial matches', () => {
      const results = fuzzySearchCities(mockCities, 'Van');
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Vancouver');
      expect(results[1].name).toBe('Britannia Beach');
    });

    it('should find fuzzy matches with typos', () => {
      const results = fuzzySearchCities(mockCities, 'Vancuver');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Vancouver');
    });

    it('should find matches in different parts of the name', () => {
      const results = fuzzySearchCities(mockCities, 'loops');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Kamloops');
    });

    it('should handle missing words in city names', () => {
      // Should find "New Westminster" when searching "Westminster"
      const results1 = fuzzySearchCities(mockCities, 'Westminster');
      expect(results1).toHaveLength(1);
      expect(results1[0].name).toBe('New Westminster');

      // Should find "Port Coquitlam" when searching "Coquitlam"
      const results2 = fuzzySearchCities(mockCities, 'Coquitlam');
      expect(results2).toHaveLength(1);
      expect(results2[0].name).toBe('Port Coquitlam');
    });

    it('should handle missing middle words', () => {
      // Should find "Fort St. John" when searching "Fort John" (missing "St.")
      const results = fuzzySearchCities(mockCities, 'Fort John');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Fort St. John');
    });

    it('should return empty array for no matches', () => {
      const results = fuzzySearchCities(mockCities, 'xyz');
      expect(results).toHaveLength(0);
    });
  });

  describe('fuzzySearchBestCity', () => {
    it('should find exact matches', () => {
      const result = fuzzySearchBestCity(mockCities, 'Vancouver');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Vancouver');
    });

    it('should find exact matches for long city names', () => {
      const result = fuzzySearchBestCity(mockCities, 'Ainsworth Hot Springs');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Ainsworth Hot Springs');
    });

    it('should find exact matches for single word cities', () => {
      const result = fuzzySearchBestCity(mockCities, 'Beach');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Beach');
    });

    it('should find matches with minor typos', () => {
      const result = fuzzySearchBestCity(mockCities, 'britanni beach');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Britannia Beach');
    });

    it('should find prefix matches', () => {
      const result = fuzzySearchBestCity(mockCities, 'welcome');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Welcome Beach');
    });

    it('should reject substring matches at end of name', () => {
      const result = fuzzySearchBestCity(mockCities, 'beach');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('Beach'); // Should match "Beach", not "Welcome Beach" or "Britannia Beach"
    });

    it('should return null for no matches', () => {
      const result = fuzzySearchBestCity(mockCities, 'xyz');
      expect(result).toBeNull();
    });

    it('should return null for empty query', () => {
      const result = fuzzySearchBestCity(mockCities, '');
      expect(result).toBeNull();
    });

    it('should return null for whitespace query', () => {
      const result = fuzzySearchBestCity(mockCities, '   ');
      expect(result).toBeNull();
    });
  });
});
