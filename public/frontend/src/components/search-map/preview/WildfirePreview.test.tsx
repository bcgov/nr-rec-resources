import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WildfirePreview from '@/components/search-map/preview/WildfirePreview';
import Feature from 'ol/Feature';
import { formatDateTimeFull } from '@shared/utils';

const createMockFeature = (props: Record<string, any>) => new Feature(props);

describe('WildfirePreview', () => {
  const fireProps = {
    FIRE_NUMBER: 'K51045',
    FIRE_STATUS: 'Out of Control',
    IGNITION_DATE: '2024-08-01',
    CURRENT_SIZE: 123.45,
    GEOGRAPHIC_DESCRIPTION: 'Near Kelowna, BC',
    FIRE_URL: 'https://example.com/fire/k51045',
  };

  it('renders wildfire location details correctly', () => {
    const feature = createMockFeature(fireProps);
    render(<WildfirePreview feature={feature} type="location" />);

    expect(
      screen.getByText(`Fire #: ${fireProps.FIRE_NUMBER}`),
    ).toBeInTheDocument();
    expect(screen.getByText(fireProps.FIRE_STATUS)).toBeInTheDocument();
    expect(
      screen.getByText(
        `Discovered on ${formatDateTimeFull(fireProps.IGNITION_DATE, { timeZone: 'America/Vancouver', timeZoneName: 'short' })}`,
      ),
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
    render(<WildfirePreview feature={emptyFeature} type="location" />);
    expect(screen.queryByText(/Fire #/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Discovered on/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hectares/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Near/)).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const feature = createMockFeature(fireProps);

    render(
      <WildfirePreview feature={feature} type="location" onClose={onClose} />,
    );
    const button = screen.getByRole('button', { name: /close preview/i });

    fireEvent.click(button);
    expect(onClose).toHaveBeenCalledOnce();
  });

  describe('type="perimeter"', () => {
    const perimeterProps = {
      FIRE_NUMBER: 'K51045',
      FIRE_STATUS: 'Out of Control',
      TRACK_DATE: '2024-08-10T08:00:00Z',
      FIRE_SIZE_HECTARES: 4500,
      FIRE_URL: 'https://example.com/fire/k51045',
    };

    it('renders perimeter-specific fields', () => {
      const feature = createMockFeature(perimeterProps);
      render(<WildfirePreview feature={feature} type="perimeter" />);

      expect(
        screen.getByText(`Fire #: ${perimeterProps.FIRE_NUMBER}`),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `${Number(perimeterProps.FIRE_SIZE_HECTARES).toLocaleString()} Hectares`,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          `Discovered on ${formatDateTimeFull(perimeterProps.TRACK_DATE, { timeZone: 'America/Vancouver', timeZoneName: 'short' })}`,
        ),
      ).toBeInTheDocument();
    });

    it('renders an outline (unfilled) status circle for perimeter type', () => {
      const feature = createMockFeature(perimeterProps);
      render(<WildfirePreview feature={feature} type="perimeter" />);

      const circle = document.querySelector('circle');
      expect(circle).toHaveAttribute('fill', 'none');
    });

    it('renders a filled status circle for location type', () => {
      const feature = createMockFeature(perimeterProps);
      render(<WildfirePreview feature={feature} type="location" />);

      const circle = document.querySelector('circle');
      expect(circle).not.toHaveAttribute('fill', 'none');
    });
  });

  describe('perimeter type - fetch geographic description', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('fetches and displays geographic description for perimeter type', async () => {
      const feature = createMockFeature({
        FIRE_NUMBER: 'K51045',
        FIRE_STATUS: 'Out of Control',
        TRACK_DATE: '2024-08-10T08:00:00Z',
        FIRE_SIZE_HECTARES: 100,
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            features: [
              { attributes: { GEOGRAPHIC_DESCRIPTION: 'Near Vancouver' } },
            ],
          }),
      } as any);

      render(<WildfirePreview feature={feature} type="perimeter" />);

      await waitFor(() => {
        expect(screen.getByText('Near Vancouver')).toBeDefined();
      });
    });

    it('handles fetch failure gracefully (no description shown)', async () => {
      const feature = createMockFeature({
        FIRE_NUMBER: 'K51045',
        FIRE_STATUS: 'Out of Control',
        TRACK_DATE: '2024-08-10T08:00:00Z',
      });

      vi.spyOn(global, 'fetch').mockRejectedValueOnce(
        new Error('Network error'),
      );

      render(<WildfirePreview feature={feature} type="perimeter" />);

      // Should not crash – geographic description stays null
      await waitFor(() => {
        expect(screen.queryByText(/Near/)).toBeNull();
      });
    });

    it('handles missing features array in fetch response', async () => {
      const feature = createMockFeature({
        FIRE_NUMBER: 'K51045',
        TRACK_DATE: '2024-08-10T08:00:00Z',
      });

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        json: () => Promise.resolve({ features: [] }),
      } as any);

      render(<WildfirePreview feature={feature} type="perimeter" />);

      await waitFor(() => {
        expect(screen.queryByText(/Near/)).toBeNull();
      });
    });

    it('does not fetch when type is "location"', () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({}),
      } as any);

      const feature = createMockFeature({
        FIRE_NUMBER: 'K51045',
        GEOGRAPHIC_DESCRIPTION: 'Near Kelowna',
      });

      render(<WildfirePreview feature={feature} type="location" />);

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('does not fetch when fireNumber is undefined', () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        json: () => Promise.resolve({}),
      } as any);

      const feature = createMockFeature({});
      render(<WildfirePreview feature={feature} type="perimeter" />);

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('fireUrl construction', () => {
    it('uses WILDFIRE_BC_URL with fireNumber when no FIRE_URL set', () => {
      const feature = createMockFeature({ FIRE_NUMBER: 'K51045' });
      render(<WildfirePreview feature={feature} type="location" />);
      const links = screen.getAllByRole('link', { name: /full details/i });
      links.forEach((link) => {
        expect(link).toHaveAttribute('href', expect.stringContaining('K51045'));
      });
    });

    it('uses base WILDFIRE_BC_URL when no fireNumber and no FIRE_URL', () => {
      const feature = createMockFeature({});
      render(<WildfirePreview feature={feature} type="location" />);
      const links = screen.getAllByRole('link', { name: /full details/i });
      links.forEach((link) => {
        expect(link).toHaveAttribute(
          'href',
          'https://wildfiresituation.nrs.gov.bc.ca/map',
        );
      });
    });
  });
});
