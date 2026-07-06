import { render } from '@testing-library/react';
import { getStatusIcon } from './getStatusIcon';

const BLUE_FILL = '#003366';
const YELLOW_FILL = '#A5792B';
const RED_FILL = '#D8292F';

const getOuterFill = (grouplabel?: string | null) => {
  const { container } = render(<>{getStatusIcon(grouplabel)}</>);
  return container.querySelector('rect')?.getAttribute('fill');
};

describe('getStatusIcon', () => {
  it('returns blue icon for null', () => {
    expect(getOuterFill(null)).toBe(BLUE_FILL);
  });

  it('returns blue icon for undefined', () => {
    expect(getOuterFill(undefined)).toBe(BLUE_FILL);
  });

  it('returns blue icon for Open', () => {
    expect(getOuterFill('Open')).toBe(BLUE_FILL);
  });

  it('returns blue icon for an unknown grouplabel', () => {
    expect(getOuterFill('Information')).toBe(BLUE_FILL);
  });

  it('returns red icon for Closed', () => {
    expect(getOuterFill('Closed')).toBe(RED_FILL);
  });

  it('returns red icon for Restricted', () => {
    expect(getOuterFill('Restricted')).toBe(RED_FILL);
  });

  it('returns red icon case-insensitively for CLOSED', () => {
    expect(getOuterFill('CLOSED')).toBe(RED_FILL);
  });

  it('returns yellow icon for Seasonal restrictions', () => {
    expect(getOuterFill('Seasonal restrictions')).toBe(YELLOW_FILL);
  });

  it('returns yellow icon for Visit with caution', () => {
    expect(getOuterFill('Visit with caution')).toBe(YELLOW_FILL);
  });

  it('returns yellow icon for Limited access', () => {
    expect(getOuterFill('Limited access')).toBe(YELLOW_FILL);
  });

  it('returns yellow icon case-insensitively for SEASONAL RESTRICTIONS', () => {
    expect(getOuterFill('SEASONAL RESTRICTIONS')).toBe(YELLOW_FILL);
  });

  it('renders an svg with aria-hidden for every branch', () => {
    for (const label of [null, 'Open', 'Closed', 'Seasonal restrictions']) {
      const { container } = render(<>{getStatusIcon(label)}</>);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    }
  });
});
