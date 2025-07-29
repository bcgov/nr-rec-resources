import { render, screen } from '@testing-library/react';
import { SuggestionMenu } from './SuggestionMenu';
import {
  RecreationSuggestion,
  City,
} from '@/components/recreation-suggestion-form/types';

vi.mock('@/components/recreation-suggestion-form/SuggestionListItem', () => ({
  SuggestionListItem: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/components/recreation-suggestion-form/SuggestionListCity', () => ({
  SuggestionListCity: ({ city }: { city: string }) => <div>{city}</div>,
}));

describe('SuggestionMenu', () => {
  const defaultResults: RecreationSuggestion[] = [
    {
      rec_resource_id: '1',
      recreation_resource_type_code: 'trail',
      recreation_resource_type: 'Recreation Trail',
      closest_community: 'Squamish',
      name: 'River Walk',
    },
  ] as any;

  const defaultCities: City[] = [{ name: 'Vancouver' }] as any;

  const menuProps = {
    id: 'test-menu',
    labelledBy: 'test-label',
  };

  it('renders results and city options with labels', () => {
    render(
      <SuggestionMenu
        results={defaultResults}
        cityOptions={defaultCities}
        searchTerm="river"
        menuProps={menuProps}
      />,
    );

    expect(screen.getByText('Sites and trails')).toBeInTheDocument();

    expect(screen.getByText('River Walk')).toBeInTheDocument();

    expect(screen.getByText('Location')).toBeInTheDocument();

    expect(screen.getByText('Vancouver')).toBeInTheDocument();
  });

  it('does not render results label or items when results are empty', () => {
    render(
      <SuggestionMenu
        results={[]}
        cityOptions={defaultCities}
        searchTerm="river"
        menuProps={menuProps}
      />,
    );

    expect(screen.queryByText('Sites and trails')).not.toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Vancouver')).toBeInTheDocument();
  });

  it('does not render location label or items when cityOptions are empty', () => {
    render(
      <SuggestionMenu
        results={defaultResults}
        cityOptions={[]}
        searchTerm="river"
        menuProps={menuProps}
      />,
    );

    expect(screen.getByText('Sites and trails')).toBeInTheDocument();
    expect(screen.getByText('River Walk')).toBeInTheDocument();
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });
});
