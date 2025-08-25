import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  BreadcrumbItem,
  breadcrumbStore,
  useBreadcrumbs,
} from "@shared/components/breadcrumbs";

// Mock useMatches hook
const mockMatches = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useMatches: () => mockMatches(),
  };
});

// Helper function to render hook with router
const renderHookWithRouter = (hook: () => any, initialEntries = ["/"]) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );
  return renderHook(hook, { wrapper });
};

describe("useBreadcrumbs Hook", () => {
  beforeEach(() => {
    // Reset store state
    breadcrumbStore.setState(() => ({
      items: [],
      previousRoute: undefined,
    }));
    mockMatches.mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic functionality", () => {
    it("returns initial empty breadcrumbs state", () => {
      const { result } = renderHookWithRouter(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toEqual([]);
      expect(typeof result.current.setBreadcrumbs).toBe("function");
      expect(typeof result.current.generateBreadcrumbs).toBe("function");
    });

    it("subscribes to store and updates state on changes", () => {
      const { result } = renderHookWithRouter(() => useBreadcrumbs());

      const newItems: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Test", isCurrent: true },
      ];

      act(() => {
        result.current.setBreadcrumbs(newItems);
      });

      expect(result.current.breadcrumbs).toEqual(newItems);
    });
  });

  describe("Custom items", () => {
    it("uses custom items when provided", () => {
      const customItems: BreadcrumbItem[] = [
        { label: "Custom Home", href: "/" },
        { label: "Custom Page", isCurrent: true },
      ];

      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({ customItems }),
      );

      expect(result.current.breadcrumbs).toEqual(customItems);
    });

    it("updates breadcrumbs when custom items change", () => {
      const initialItems: BreadcrumbItem[] = [{ label: "Initial", href: "/" }];

      let currentItems = initialItems;
      const { result, rerender } = renderHookWithRouter(() =>
        useBreadcrumbs({ customItems: currentItems }),
      );

      expect(result.current.breadcrumbs).toEqual(initialItems);

      const newItems: BreadcrumbItem[] = [{ label: "Updated", href: "/" }];
      currentItems = newItems;

      rerender();
      expect(result.current.breadcrumbs).toEqual(newItems);
    });
  });

  describe("Route handles", () => {
    it("uses route handles when available", () => {
      const mockBreadcrumbFunction = vi.fn().mockReturnValue([
        { label: "Route Home", href: "/" },
        { label: "Route Page", isCurrent: true },
      ]);

      mockMatches.mockReturnValue([
        {
          handle: {
            breadcrumb: mockBreadcrumbFunction,
          },
        },
      ]);

      const context = { resourceName: "Test Resource" };
      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({ context }),
      );

      expect(mockBreadcrumbFunction).toHaveBeenCalledWith(context);
      expect(result.current.breadcrumbs).toEqual([
        { label: "Route Home", href: "/" },
        { label: "Route Page", isCurrent: true },
      ]);
    });

    it("finds the last match with breadcrumb handle", () => {
      const firstBreadcrumb = vi
        .fn()
        .mockReturnValue([{ label: "First", href: "/" }]);
      const lastBreadcrumb = vi
        .fn()
        .mockReturnValue([{ label: "Last", href: "/" }]);

      mockMatches.mockReturnValue([
        { handle: { breadcrumb: firstBreadcrumb } },
        { handle: {} }, // No breadcrumb
        { handle: { breadcrumb: lastBreadcrumb } },
      ]);

      const { result } = renderHookWithRouter(() => useBreadcrumbs());

      expect(lastBreadcrumb).toHaveBeenCalled();
      expect(firstBreadcrumb).not.toHaveBeenCalled();
      expect(result.current.breadcrumbs).toEqual([
        { label: "Last", href: "/" },
      ]);
    });

    it("handles matches without breadcrumb handles", () => {
      mockMatches.mockReturnValue([
        { handle: {} },
        { handle: null },
        {}, // No handle at all
      ]);

      const { result } = renderHookWithRouter(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toEqual([]);
    });
  });

  describe("Custom breadcrumb generator", () => {
    it("uses custom generator when no route handles available", () => {
      const customGenerator = vi.fn().mockReturnValue([
        { label: "Generated Home", href: "/" },
        { label: "Generated Page", isCurrent: true },
      ]);

      mockMatches.mockReturnValue([]);

      const context = { resourceName: "Test" };
      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({
          breadcrumbGenerator: customGenerator,
          context,
        }),
      );

      expect(customGenerator).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: "/" }),
        context,
      );
      expect(result.current.breadcrumbs).toEqual([
        { label: "Generated Home", href: "/" },
        { label: "Generated Page", isCurrent: true },
      ]);
    });

    it("prioritizes route handles over custom generator", () => {
      const routeBreadcrumb = vi
        .fn()
        .mockReturnValue([{ label: "Route", href: "/" }]);
      const customGenerator = vi
        .fn()
        .mockReturnValue([{ label: "Custom", href: "/" }]);

      mockMatches.mockReturnValue([
        { handle: { breadcrumb: routeBreadcrumb } },
      ]);

      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({ breadcrumbGenerator: customGenerator }),
      );

      expect(routeBreadcrumb).toHaveBeenCalled();
      expect(customGenerator).not.toHaveBeenCalled();
      expect(result.current.breadcrumbs).toEqual([
        { label: "Route", href: "/" },
      ]);
    });
  });

  describe("Auto-generation", () => {
    it("automatically generates breadcrumbs by default", () => {
      const customGenerator = vi
        .fn()
        .mockReturnValue([{ label: "Auto Generated", href: "/" }]);

      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({ breadcrumbGenerator: customGenerator }),
      );

      expect(customGenerator).toHaveBeenCalled();
      expect(result.current.breadcrumbs).toEqual([
        { label: "Auto Generated", href: "/" },
      ]);
    });

    it("does not auto-generate when autoGenerate is false", () => {
      const customGenerator = vi
        .fn()
        .mockReturnValue([{ label: "Should Not Generate", href: "/" }]);

      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({
          breadcrumbGenerator: customGenerator,
          autoGenerate: false,
        }),
      );

      expect(customGenerator).not.toHaveBeenCalled();
      expect(result.current.breadcrumbs).toEqual([]);
    });

    it("can manually generate breadcrumbs when autoGenerate is false", () => {
      const customGenerator = vi
        .fn()
        .mockReturnValue([{ label: "Manual Generation", href: "/" }]);

      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({
          breadcrumbGenerator: customGenerator,
          autoGenerate: false,
        }),
      );

      expect(result.current.breadcrumbs).toEqual([]);

      act(() => {
        result.current.generateBreadcrumbs();
      });

      expect(customGenerator).toHaveBeenCalled();
      expect(result.current.breadcrumbs).toEqual([
        { label: "Manual Generation", href: "/" },
      ]);
    });
  });

  describe("Context handling", () => {
    it("passes context to breadcrumb functions", () => {
      const routeBreadcrumb = vi.fn().mockReturnValue([]);

      mockMatches.mockReturnValue([
        { handle: { breadcrumb: routeBreadcrumb } },
      ]);

      const context = {
        resourceName: "Test Resource",
        resourceId: "123",
      };

      renderHookWithRouter(() => useBreadcrumbs({ context }));

      expect(routeBreadcrumb).toHaveBeenCalledWith(context);
    });

    it("handles undefined context", () => {
      const routeBreadcrumb = vi.fn().mockReturnValue([]);

      mockMatches.mockReturnValue([
        { handle: { breadcrumb: routeBreadcrumb } },
      ]);

      renderHookWithRouter(() => useBreadcrumbs());

      expect(routeBreadcrumb).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Location changes", () => {
    it("regenerates breadcrumbs when location changes", () => {
      const customGenerator = vi
        .fn()
        .mockReturnValue([{ label: "Location Test", href: "/" }]);

      const { result } = renderHookWithRouter(() =>
        useBreadcrumbs({ breadcrumbGenerator: customGenerator }),
      );

      expect(customGenerator).toHaveBeenCalledTimes(1);

      // Simulate triggering the effect by manually calling generateBreadcrumbs
      act(() => {
        result.current.generateBreadcrumbs();
      });

      expect(customGenerator).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error handling", () => {
    it("handles errors in breadcrumb generation gracefully", () => {
      const errorGenerator = vi.fn().mockImplementation(() => {
        throw new Error("Test error");
      });

      // Should not throw an error
      expect(() => {
        renderHookWithRouter(() =>
          useBreadcrumbs({ breadcrumbGenerator: errorGenerator }),
        );
      }).not.toThrow();
    });

    it("handles malformed route handles", () => {
      mockMatches.mockReturnValue([
        { handle: { breadcrumb: null } },
        { handle: { breadcrumb: "not a function" } },
        { handle: { breadcrumb: undefined } },
      ]);

      const { result } = renderHookWithRouter(() => useBreadcrumbs());

      expect(result.current.breadcrumbs).toEqual([]);
    });
  });
});
