import { render, screen } from '@testing-library/react';
import Facilities from '@/components/rec-resource/section/Facilities';

describe('Facilities Component', () => {
  it('should render the Facilities section when facilities are available', () => {
    render(
      <Facilities
        recreation_structure={{ has_toilet: true, has_table: true }}
      />,
    );

    expect(screen.getByText('Facilities')).toBeInTheDocument();
    expect(screen.getByText('Toilets')).toBeInTheDocument();
    expect(screen.getByText('Tables')).toBeInTheDocument();
    expect(screen.getByAltText('Toilets icon')).toBeInTheDocument();
    expect(screen.getByAltText('Tables icon')).toBeInTheDocument();
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
    expect(screen.getByText('Toilets')).toBeInTheDocument();
    expect(screen.getByAltText('Toilets icon')).toBeInTheDocument();
    expect(screen.queryByText('Tables')).not.toBeInTheDocument();
    expect(screen.queryByAltText('Tables icon')).not.toBeInTheDocument();
  });

  it('should render the correct icons based on facilityMap', () => {
    render(
      <Facilities
        recreation_structure={{ has_toilet: true, has_table: true }}
      />,
    );

    expect(screen.getByAltText('Toilets icon')).toBeInTheDocument();
    expect(screen.getByAltText('Tables icon')).toBeInTheDocument();
  });
});
