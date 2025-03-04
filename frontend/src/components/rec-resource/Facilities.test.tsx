import { render, screen } from '@testing-library/react';
import Facilities from '@/components/rec-resource/Facilities';

describe('Facilities Component', () => {
  it('should render the Facilities section when facilities are available', () => {
    render(
      <Facilities
        recreation_structure={{ has_toilet: true, has_table: true }}
      />,
    );

    expect(screen.getByText('Facilities')).toBeInTheDocument();
    expect(screen.getByText('Toilet')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByAltText('Toilet icon')).toBeInTheDocument();
    expect(screen.getByAltText('Table icon')).toBeInTheDocument();
  });

  it('should not render the Facilities section when no facilities are available', () => {
    const { container } = render(
      <Facilities
        recreation_structure={{ has_toilet: false, has_table: false }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render only the available facilities', () => {
    render(
      <Facilities
        recreation_structure={{ has_toilet: true, has_table: false }}
      />,
    );

    expect(screen.getByText('Facilities')).toBeInTheDocument();
    expect(screen.getByText('Toilet')).toBeInTheDocument();
    expect(screen.getByAltText('Toilet icon')).toBeInTheDocument();
    expect(screen.queryByText('Table')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Table icon')).not.toBeInTheDocument();
  });

  it('should render the correct icons based on facilityMap', () => {
    render(
      <Facilities
        recreation_structure={{ has_toilet: true, has_table: true }}
      />,
    );

    expect(screen.getByAltText('Toilet icon')).toBeInTheDocument();
    expect(screen.getByAltText('Table icon')).toBeInTheDocument();
  });
});
