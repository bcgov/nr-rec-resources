import { render, screen, fireEvent } from '@testing-library/react';
import LocationSearchMenu from '@/components/recreation-search-form/location-search/LocationSearchMenu';
import { CURRENT_LOCATION_TITLE } from '@/components/recreation-search-form/location-search/LocationSearch';
import { vi } from 'vitest';

describe('LocationSearchMenu', () => {
  const baseProps = {
    isError: false,
    refetch: vi.fn(),
    latitude: 0,
    longitude: 0,
    onGetLocation: vi.fn(),
  };

  const fakeCities = [
    { cityName: 'Victoria', latitude: 0, longitude: 0, id: 1, rank: 1 },
    { cityName: 'Vancouver', latitude: 0, longitude: 0, id: 2, rank: 2 },
  ];

  it('renders city options', () => {
    render(<LocationSearchMenu {...baseProps} results={fakeCities} />);

    expect(screen.getByText('Victoria')).toBeInTheDocument();
    expect(screen.getByText('Vancouver')).toBeInTheDocument();
  });

  it('renders current location with icon and calls onGetLocation when clicked', () => {
    const onGetLocation = vi.fn();

    const currentLocationOption = {
      cityName: CURRENT_LOCATION_TITLE,
      latitude: 0,
      longitude: 0,
      id: 0,
      rank: 0,
    };

    render(
      <LocationSearchMenu
        {...baseProps}
        results={[currentLocationOption]}
        onGetLocation={onGetLocation}
      />,
    );

    const currentLocationItem = screen.getByText(CURRENT_LOCATION_TITLE);
    expect(currentLocationItem).toBeInTheDocument();
    const item = screen.getByText('Current location');
    expect(item.querySelector('svg')).toBeInTheDocument();

    fireEvent.click(currentLocationItem);
    expect(onGetLocation).toHaveBeenCalled();
  });

  it('renders error state and calls refetch on retry', () => {
    const refetch = vi.fn();

    render(
      <LocationSearchMenu
        {...baseProps}
        isError={true}
        results={[]}
        refetch={refetch}
      />,
    );

    expect(screen.getByText('Failed to load cities.')).toBeInTheDocument();
    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);
    expect(refetch).toHaveBeenCalled();
  });
});
