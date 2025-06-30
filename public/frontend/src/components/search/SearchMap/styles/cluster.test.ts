import { describe, it, expect } from 'vitest';
import { clusterStyle } from '@/components/search/SearchMap/styles/cluster';
import { Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';

describe('clusterStyle', () => {
  it('returns two styles for a small cluster (size = 5)', () => {
    const styles = clusterStyle(5);
    expect(styles).toHaveLength(2);

    const [, cluster] = styles;

    const image = cluster.getImage() as CircleStyle;
    const radius = image.getRadius();
    const fill = image.getFill() as Fill;
    const stroke = image.getStroke() as Stroke;
    const text = cluster.getText() as Text;

    expect(radius).toBe(14);
    expect(fill.getColor()).toBe('rgb(36,100,164)');
    expect(stroke.getWidth()).toBe(2);
    expect(text.getText()).toBe('5');
  });

  it('returns larger radius for medium cluster (size = 20)', () => {
    const styles = clusterStyle(20);
    const [, cluster] = styles;
    const image = cluster.getImage() as CircleStyle;

    expect(image.getRadius()).toBe(18);
  });

  it('returns largest radius for large cluster (size = 100)', () => {
    const styles = clusterStyle(100);
    const [, cluster] = styles;
    const image = cluster.getImage() as CircleStyle;

    expect(image.getRadius()).toBe(32);
  });
});
