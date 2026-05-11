import {
  TRAIL_TYPE_OPTIONS,
  trailFormSchema,
  TrailFormData,
} from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/schemas/trailForm';
import { describe, expect, it } from 'vitest';

describe('trailFormSchema', () => {
  describe('name', () => {
    it('should accept a valid name', () => {
      const result = trailFormSchema.safeParse({ name: 'My Trail' });
      expect(result.success).toBe(true);
    });

    it('should reject an empty name', () => {
      const result = trailFormSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Trail name is required');
      }
    });

    it('should reject a name longer than 120 characters', () => {
      const result = trailFormSchema.safeParse({ name: 'a'.repeat(121) });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Trail name must be 120 characters or fewer',
        );
      }
    });

    it('should accept a name exactly 120 characters long', () => {
      const result = trailFormSchema.safeParse({ name: 'a'.repeat(120) });
      expect(result.success).toBe(true);
    });
  });

  describe('trail_type', () => {
    it('should accept GREEN', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        trail_type: 'GREEN',
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.trail_type).toBe('GREEN');
    });

    it('should accept BLUE', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        trail_type: 'BLUE',
      });
      expect(result.success).toBe(true);
    });

    it('should accept BLACK', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        trail_type: 'BLACK',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null trail_type', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        trail_type: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept undefined trail_type', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        trail_type: undefined,
      });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid trail_type', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        trail_type: 'PURPLE',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description', () => {
    it('should accept a description', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        description: 'Nice trail',
      });
      expect(result.success).toBe(true);
    });

    it('should accept an empty description', () => {
      const result = trailFormSchema.safeParse({
        name: 'Trail',
        description: '',
      });
      expect(result.success).toBe(true);
    });

    it('should accept no description', () => {
      const result = trailFormSchema.safeParse({ name: 'Trail' });
      expect(result.success).toBe(true);
    });
  });

  it('should parse a fully valid trail form', () => {
    const input = {
      name: 'Summit Loop',
      trail_type: 'BLUE',
      description: 'A beautiful blue trail.',
    };
    const result = trailFormSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      const data: TrailFormData = result.data;
      expect(data.name).toBe('Summit Loop');
      expect(data.trail_type).toBe('BLUE');
      expect(data.description).toBe('A beautiful blue trail.');
    }
  });
});

describe('TRAIL_TYPE_OPTIONS', () => {
  it('should contain all three difficulty levels', () => {
    const ids = TRAIL_TYPE_OPTIONS.map((o) => o.id);
    expect(ids).toContain('GREEN');
    expect(ids).toContain('BLUE');
    expect(ids).toContain('BLACK');
    expect(ids).toHaveLength(3);
  });

  it('should have descriptive labels', () => {
    const greenOption = TRAIL_TYPE_OPTIONS.find((o) => o.id === 'GREEN');
    const blueOption = TRAIL_TYPE_OPTIONS.find((o) => o.id === 'BLUE');
    const blackOption = TRAIL_TYPE_OPTIONS.find((o) => o.id === 'BLACK');

    expect(greenOption?.label).toBe('Green (Easy)');
    expect(blueOption?.label).toBe('Blue (Intermediate)');
    expect(blackOption?.label).toBe('Black (Advanced)');
  });
});
