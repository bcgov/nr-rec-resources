import { describe, it, expect } from 'vitest';
import { clusterStyle } from '@/components/search/SearchMap/styles/cluster';
import { Circle as CircleStyle, Text } from 'ol/style';

describe('clusterStyle', () => {
  it('returns two styles for a small cluster (size = 5)', () => {
    const styles = clusterStyle({ size: 5 });
    expect(styles).toHaveLength(2);

    const [halo, cluster] = styles;

    const haloImage = halo.getImage() as CircleStyle;
    expect(haloImage.getRadius()).toBe(14 + 2);
    expect(haloImage.getStroke()!.getColor()).toBe('rgba(255, 255, 255, 0.7)');
    expect(haloImage.getStroke()!.getWidth()).toBe(6);
    expect(haloImage.getFill()!.getColor()).toBe('transparent');

    const clusterImage = cluster.getImage() as CircleStyle;
    expect(clusterImage.getRadius()).toBe(14);
    expect(clusterImage.getStroke()!.getColor()).toBe('rgb(36,100,164)');
    expect(clusterImage.getStroke()!.getWidth()).toBe(2);
    expect(clusterImage.getFill()!.getColor()).toBe('rgba(36,100,164, 0.85)');

    const text = cluster.getText() as Text;
    expect(text.getText()).toBe('5');
    expect(text.getFill()!.getColor()).toBe('#FFF');
    expect(text.getScale()).toBe(1.8);
  });

  it('returns correct radius for medium cluster (size = 20)', () => {
    const [, cluster] = clusterStyle({ size: 20 });
    const image = cluster.getImage() as CircleStyle;
    expect(image.getRadius()).toBe(18);
  });

  it('returns correct radius for large cluster (size = 100)', () => {
    const [, cluster] = clusterStyle({ size: 100 });
    const image = cluster.getImage() as CircleStyle;
    expect(image.getRadius()).toBe(32);
  });

  it('supports custom opacity options', () => {
    const [halo, cluster] = clusterStyle({
      size: 5,
      clusterOpacity: 0.5,
      haloOpacity: 0.2,
    });

    const haloImage = halo.getImage() as CircleStyle;
    expect(haloImage.getStroke()!.getColor()).toBe('rgba(255, 255, 255, 0.2)');

    const clusterImage = cluster.getImage() as CircleStyle;
    expect(clusterImage.getFill()!.getColor()).toBe('rgba(36,100,164, 0.5)');
  });
});
