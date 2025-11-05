import { act, renderHook } from '@testing-library/react';
import { useContactPage } from './useContactPage';
import { CONTACT_TOPICS } from '../constants';
import { vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({
  useParams: () => ({ id: '123' }),
  useMatches: () => [],
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
}));

vi.mock(
  '@/service/queries/recreation-resource/recreationResourceQueries',
  () => ({
    useGetRecreationResourceById: () => ({
      data: { name: 'Test Resource' },
    }),
  }),
);

vi.mock('@/utils/getContactEmailLink', () => ({
  getContactEmailLink: () => 'mailto:test@example.com',
}));

vi.mock('../utils/contactDetailsRenderer', () => ({
  renderContactDetails: vi.fn(({ topic }) => `Mock component for ${topic}`),
}));

vi.mock('@/constants/routes', () => ({
  ROUTE_TITLES: {
    REC_RESOURCE_CONTACT: (name: string) =>
      `Contact Us - ${name} | Sites and Trails BC`,
  },
}));

const mockResource = {
  name: 'Test Resource',
} as any;

describe('useContactPage', () => {
  it('should return all necessary data and functions', () => {
    const { result } = renderHook(() => useContactPage(mockResource));

    expect(result.current).toHaveProperty('selectedTopic');
    expect(result.current).toHaveProperty('setSelectedTopic');
    expect(result.current).toHaveProperty('contactDetailsComponent');
    expect(result.current).toHaveProperty('emailLink');
    expect(result.current).toHaveProperty('pageTitle');
    expect(result.current).toHaveProperty('selectedTopic');
    expect(result.current).toHaveProperty('setSelectedTopic');
    expect(result.current).toHaveProperty('contactDetailsComponent');
    expect(result.current).toHaveProperty('emailLink');
    expect(result.current).toHaveProperty('pageTitle');
  });

  it('should initialize with default topic', () => {
    const { result } = renderHook(() => useContactPage(mockResource));

    expect(result.current.selectedTopic).toBe(CONTACT_TOPICS.RESERVATIONS);
  });

  it('should update selected topic when setSelectedTopic is called', () => {
    const { result } = renderHook(() => useContactPage(mockResource));

    act(() => {
      result.current.setSelectedTopic(CONTACT_TOPICS.WILDFIRES);
    });

    expect(result.current.selectedTopic).toBe(CONTACT_TOPICS.WILDFIRES);
  });

  it('should compute page title correctly', () => {
    const { result } = renderHook(() => useContactPage(mockResource));

    expect(result.current.pageTitle).toBe(
      'Contact Us - Test Resource | Sites and Trails BC',
    );
  });

  it('should provide email link', () => {
    const { result } = renderHook(() => useContactPage(mockResource));

    expect(result.current.emailLink).toBe('mailto:test@example.com');
  });

  it('should maintain stable reference for setSelectedTopic', () => {
    const { result, rerender } = renderHook(() => useContactPage(mockResource));

    const initialSetTopic = result.current.setSelectedTopic;

    rerender();

    expect(result.current.setSelectedTopic).toBe(initialSetTopic);
  });
});
