import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WildfirePerimeterPreview from '@/components/search-map/preview/WildfirePerimeterPreview';
import Feature from 'ol/Feature';

vi.mock('@/components/search-map/preview/WildfirePreview', () => ({
  default: vi.fn(({ onClose, feature, type }: any) => (
    <div
      data-testid="wildfire-preview"
      data-type={type}
      data-feature={feature?.getId?.()}
    >
      <button onClick={onClose}>Close</button>
    </div>
  )),
}));

describe('WildfirePerimeterPreview', () => {
  it('renders WildfirePreview with type="perimeter"', () => {
    const feature = new Feature();
    render(<WildfirePerimeterPreview perimeterFeature={feature} />);
    expect(screen.getByTestId('wildfire-preview')).toHaveAttribute(
      'data-type',
      'perimeter',
    );
  });

  it('passes onClose callback to WildfirePreview', () => {
    const onClose = vi.fn();
    const feature = new Feature();
    render(
      <WildfirePerimeterPreview perimeterFeature={feature} onClose={onClose} />,
    );
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('works without onClose prop', () => {
    const feature = new Feature();
    render(<WildfirePerimeterPreview perimeterFeature={feature} />);
    expect(screen.getByTestId('wildfire-preview')).toBeDefined();
  });
});
