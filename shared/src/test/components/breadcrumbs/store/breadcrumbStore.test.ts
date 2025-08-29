import { describe, it, expect, beforeEach } from 'vitest';
import {
  breadcrumbStore,
  setBreadcrumbs,
  setPreviousRoute,
  getBreadcrumbState,
  useBreadcrumbItems,
  usePreviousRoute,
  useBreadcrumbState,
} from '@shared/components/breadcrumbs';
import { BreadcrumbItem } from '@shared/components/breadcrumbs/types';
import { renderHook } from '@testing-library/react';

describe('Breadcrumb Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    breadcrumbStore.setState(() => ({
      items: [],
      previousRoute: undefined,
    }));
  });

  describe('Initial State', () => {
    it('has empty initial state', () => {
      const state = breadcrumbStore.state;
      expect(state.items).toEqual([]);
      expect(state.previousRoute).toBeUndefined();
    });
  });

  describe('setBreadcrumbs', () => {
    it('sets breadcrumb items', () => {
      const newItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Test', isCurrent: true },
      ];

      setBreadcrumbs(newItems);

      const state = breadcrumbStore.state;
      expect(state.items).toEqual(newItems);
    });

    it('replaces existing items', () => {
      // Set initial items
      const initialItems: BreadcrumbItem[] = [
        { label: 'Initial', href: '/initial' },
      ];
      setBreadcrumbs(initialItems);

      expect(breadcrumbStore.state.items).toEqual(initialItems);

      // Replace with new items
      const newItems: BreadcrumbItem[] = [
        { label: 'New', href: '/new' },
        { label: 'Current', isCurrent: true },
      ];
      setBreadcrumbs(newItems);

      expect(breadcrumbStore.state.items).toEqual(newItems);
    });

    it('can set empty array', () => {
      // Set some items first
      setBreadcrumbs([{ label: 'Test', href: '/test' }]);
      expect(breadcrumbStore.state.items).toHaveLength(1);

      // Clear items
      setBreadcrumbs([]);
      expect(breadcrumbStore.state.items).toEqual([]);
    });
  });

  describe('setPreviousRoute', () => {
    it('sets previous route', () => {
      setPreviousRoute('/previous');

      const state = breadcrumbStore.state;
      expect(state.previousRoute).toBe('/previous');
    });

    it('updates previous route', () => {
      setPreviousRoute('/first');
      expect(breadcrumbStore.state.previousRoute).toBe('/first');

      setPreviousRoute('/second');
      expect(breadcrumbStore.state.previousRoute).toBe('/second');
    });
  });

  describe('getBreadcrumbState', () => {
    it('returns current state', () => {
      const items: BreadcrumbItem[] = [{ label: 'Test', href: '/test' }];
      setBreadcrumbs(items);
      setPreviousRoute('/prev');

      const state = getBreadcrumbState();
      expect(state.items).toEqual(items);
      expect(state.previousRoute).toBe('/prev');
    });
  });

  describe('Hooks', () => {
    describe('useBreadcrumbItems', () => {
      it('returns breadcrumb items', () => {
        const items: BreadcrumbItem[] = [
          { label: 'Home', href: '/' },
          { label: 'Current', isCurrent: true },
        ];
        setBreadcrumbs(items);

        const { result } = renderHook(() => useBreadcrumbItems());
        expect(result.current).toEqual(items);
      });
    });

    describe('usePreviousRoute', () => {
      it('returns previous route', () => {
        setPreviousRoute('/previous');

        const { result } = renderHook(() => usePreviousRoute());
        expect(result.current).toBe('/previous');
      });
    });

    describe('useBreadcrumbState', () => {
      it('returns entire breadcrumb state', () => {
        const items: BreadcrumbItem[] = [{ label: 'Test', href: '/test' }];
        setBreadcrumbs(items);
        setPreviousRoute('/prev');

        const { result } = renderHook(() => useBreadcrumbState());
        expect(result.current.items).toEqual(items);
        expect(result.current.previousRoute).toBe('/prev');
      });
    });
  });

  describe('Complex state updates', () => {
    it('preserves other properties when updating specific fields', () => {
      setBreadcrumbs([{ label: 'Initial', href: '/initial' }]);
      setPreviousRoute('/initial-route');

      // Update only items
      setBreadcrumbs([{ label: 'Updated', href: '/updated' }]);

      const state = breadcrumbStore.state;
      expect(state.items).toEqual([{ label: 'Updated', href: '/updated' }]);
      expect(state.previousRoute).toBe('/initial-route');
    });
  });
});
