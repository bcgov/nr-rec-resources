import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WildfireFeaturePreview from '@/components/search-map/preview/WildfireFeaturePreview';
import Feature from 'ol/Feature';
import { formatDate } from '@/utils/formatDate';

const createMockFeature = (props: Record<string, any>) => new Feature(props);

describe('WildfireFeaturePreview', () => {
  const fireProps = {
    FIRE_NUMBER: 'K51045',
    FIRE_STATUS: 'Out of Control',
    IGNITION_DATE: '2024-08-01',
    CURRENT_SIZE: 123.45,
    GEOGRAPHIC_DESCRIPTION: 'Near Kelowna, BC',
    FIRE_URL: 'https://example.com/fire/k51045',
  };

  it('renders wildfire details correctly', () => {
    const feature = createMockFeature(fireProps);
    render(<WildfireFeaturePreview wildfireFeature={feature} />);

    expect(
      screen.getByText(`Fire #: ${fireProps.FIRE_NUMBER}`),
    ).toBeInTheDocument();
    expect(screen.getByText(fireProps.FIRE_STATUS)).toBeInTheDocument();
    expect(
      screen.getByText(`Discovered on ${formatDate(fireProps.IGNITION_DATE)}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`${fireProps.CURRENT_SIZE} Hectares`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(fireProps.GEOGRAPHIC_DESCRIPTION),
    ).toBeInTheDocument();

    const links = screen.getAllByRole('link', { name: /full details/i });
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link).toHaveAttribute('href', fireProps.FIRE_URL);
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  it('does not render empty fields', () => {
    const emptyFeature = createMockFeature({});
    render(<WildfireFeaturePreview wildfireFeature={emptyFeature} />);
    expect(screen.queryByText(/Fire #/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Discovered on/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hectares/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Near/)).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const feature = createMockFeature(fireProps);

    render(
      <WildfireFeaturePreview wildfireFeature={feature} onClose={onClose} />,
    );
    const button = screen.getByRole('button', { name: /close preview/i });

    fireEvent.click(button);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
