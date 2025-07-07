import { describe, it, expect } from 'vitest';
import { featureLabelText } from '@/components/search/SearchMap/styles/feature';
import { Text } from 'ol/style';

describe('featureLabelText', () => {
  it('creates a Text style with correct properties', () => {
    const text = featureLabelText('Hello');

    expect(text).toBeInstanceOf(Text);
    expect(text.getText()).toBe('Hello');
    expect(text.getFont()).toBe('14px BC Sans,sans-serif');
    expect(text.getOffsetY()).toBe(-42);

    const fill = text.getFill();
    const stroke = text.getStroke();

    expect(fill?.getColor()).toBe('#000');
    expect(stroke?.getColor()).toBe('#fff');
    expect(stroke?.getWidth()).toBe(2);
  });
});
