import { render } from '@testing-library/react';
import { BlueStatusIcon, RedStatusIcon, YellowStatusIcon } from './StatusIcons';

describe('StatusIcons', () => {
  it('renders BlueStatusIcon as a decorative SVG', () => {
    const { container } = render(<BlueStatusIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('renders RedStatusIcon as a decorative SVG', () => {
    const { container } = render(<RedStatusIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('renders YellowStatusIcon as a decorative SVG', () => {
    const { container } = render(<YellowStatusIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});
