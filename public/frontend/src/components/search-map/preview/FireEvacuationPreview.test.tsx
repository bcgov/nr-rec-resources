import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Feature from 'ol/Feature';
import FireEvacuationPreview from '@/components/search-map/preview/FireEvacuationPreview';

const createMockFeature = (props: Record<string, any>) => new Feature(props);

const EMERGENCY_INFO_BC_URL = 'https://www.emergencyinfobc.gov.bc.ca/';

describe('FireEvacuationPreview', () => {
  const evacuationProps = {
    ORDER_ALERT_STATUS: 'Order',
    ORDER_ALERT_NAME: 'Evacuation Order - Zone A',
    EVENT_NAME: 'Test Fire Event',
    EVENT_TYPE: 'Wildfire',
    ISSUING_AGENCY: 'BC Wildfire Service',
    DATE_MODIFIED: '2024-08-15T10:00:00Z',
  };

  it('renders all details correctly', () => {
    const feature = createMockFeature(evacuationProps);
    render(<FireEvacuationPreview evacuationFeature={feature} />);

    // Header shows "Evacuation" and status
    expect(screen.getByText('Evacuation')).toBeInTheDocument();
    expect(screen.getAllByText('Order').length).toBeGreaterThan(0);

    // Display name prefers ORDER_ALERT_NAME over EVENT_NAME
    expect(
      screen.getByText(evacuationProps.ORDER_ALERT_NAME),
    ).toBeInTheDocument();

    // Detail fields
    expect(screen.getByText(evacuationProps.EVENT_TYPE)).toBeInTheDocument();
    expect(
      screen.getByText(evacuationProps.ISSUING_AGENCY),
    ).toBeInTheDocument();

    // Formatted date
    const expectedDate = new Date(
      evacuationProps.DATE_MODIFIED,
    ).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(
      screen.getByText(`Last updated: ${expectedDate}`),
    ).toBeInTheDocument();
  });

  it('falls back to EVENT_NAME when ORDER_ALERT_NAME is absent', () => {
    const feature = createMockFeature({
      ...evacuationProps,
      ORDER_ALERT_NAME: undefined,
    });
    render(<FireEvacuationPreview evacuationFeature={feature} />);
    expect(screen.getByText(evacuationProps.EVENT_NAME)).toBeInTheDocument();
  });

  it('does not render empty optional fields', () => {
    const feature = createMockFeature({
      ORDER_ALERT_STATUS: 'Alert',
    });
    render(<FireEvacuationPreview evacuationFeature={feature} />);

    expect(screen.queryByText(/Wildfire/)).not.toBeInTheDocument();
    expect(screen.queryByText(/BC Wildfire Service/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
    // No display name rendered when both name fields absent
    expect(
      screen.queryByText(evacuationProps.ORDER_ALERT_NAME),
    ).not.toBeInTheDocument();
  });

  it('does not render date when DATE_MODIFIED is absent', () => {
    const feature = createMockFeature({
      ...evacuationProps,
      DATE_MODIFIED: undefined,
    });
    render(<FireEvacuationPreview evacuationFeature={feature} />);
    expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
  });

  it.each([
    ['Order', 'status-order'],
    ['Tactical Evacuation', 'status-tactical'],
    ['Alert', 'status-alert'],
    ['All Clear', 'status-all-clear'],
    ['Unknown', 'status-order'], // defaults to status-order
  ])('applies correct CSS class for status "%s"', (status, expectedClass) => {
    const feature = createMockFeature({ ORDER_ALERT_STATUS: status });
    render(<FireEvacuationPreview evacuationFeature={feature} />);
    const header = document.querySelector('.evacuation-preview-header');
    expect(header).toHaveClass(expectedClass);
  });

  it('renders EmergencyInfoBC links with correct href', () => {
    const feature = createMockFeature(evacuationProps);
    render(<FireEvacuationPreview evacuationFeature={feature} />);

    const links = screen.getAllByRole('link');
    const emergencyLinks = links.filter(
      (link) => link.getAttribute('href') === EMERGENCY_INFO_BC_URL,
    );
    expect(emergencyLinks.length).toBeGreaterThan(0);
    emergencyLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    const feature = createMockFeature(evacuationProps);
    render(
      <FireEvacuationPreview evacuationFeature={feature} onClose={onClose} />,
    );

    const closeBtn = screen.getByRole('button', { name: /close preview/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
