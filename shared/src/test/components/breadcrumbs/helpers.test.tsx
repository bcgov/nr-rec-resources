import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { BreadcrumbItem } from "@shared/components/breadcrumbs";
import {
  renderBreadcrumbLabel,
  getBreadcrumbItemProps,
  getBreadcrumbKey,
} from "@shared/components/breadcrumbs/helpers";

// Mock FontAwesome components
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon.iconName}
      {...props}
    />
  ),
}));

describe("Breadcrumb Helpers", () => {
  describe("renderBreadcrumbLabel", () => {
    it("renders simple text label", () => {
      const item: BreadcrumbItem = { label: "Test Label" };
      const result = renderBreadcrumbLabel(item, false, false);
      expect(result).toBe("Test Label");
    });

    it("renders home icon for first item when showHomeIcon is true", () => {
      const item: BreadcrumbItem = { label: "Home", href: "/" };
      const result = renderBreadcrumbLabel(item, true, true);

      // Render the result to test it
      const { container } = render(<div>{result}</div>);
      const icon = container.querySelector('[data-testid="font-awesome-icon"]');

      expect(icon).toBeTruthy();
      expect(icon?.getAttribute("data-icon")).toBe("house");
      expect(icon?.getAttribute("aria-label")).toBe("Home");
      expect(icon?.getAttribute("title")).toBe("Home");
    });

    it("renders text label for first item when showHomeIcon is false", () => {
      const item: BreadcrumbItem = { label: "Home", href: "/" };
      const result = renderBreadcrumbLabel(item, false, true);
      expect(result).toBe("Home");
    });

    it("renders text label for non-first items regardless of showHomeIcon", () => {
      const item: BreadcrumbItem = { label: "Page", href: "/page" };
      const result1 = renderBreadcrumbLabel(item, true, false);
      const result2 = renderBreadcrumbLabel(item, false, false);

      expect(result1).toBe("Page");
      expect(result2).toBe("Page");
    });

    it("renders home icon only for first item", () => {
      const item: BreadcrumbItem = { label: "Not Home", href: "/other" };
      const result = renderBreadcrumbLabel(item, true, false);
      expect(result).toBe("Not Home");
    });

    it("handles empty label", () => {
      const item: BreadcrumbItem = { label: "" };
      const result = renderBreadcrumbLabel(item, false, false);
      expect(result).toBe("");
    });

    it("handles special characters in label", () => {
      const item: BreadcrumbItem = { label: 'Special & Characters "Test"' };
      const result = renderBreadcrumbLabel(item, false, false);
      expect(result).toBe('Special & Characters "Test"');
    });

    it("handles undefined showHomeIcon parameter", () => {
      const item: BreadcrumbItem = { label: "Home", href: "/" };
      const result = renderBreadcrumbLabel(item, undefined as any, true);

      // Should default to showing home icon (true)
      const { container } = render(<div>{result}</div>);
      const icon = container.querySelector('[data-testid="font-awesome-icon"]');
      expect(icon).toBeTruthy();
    });
  });

  describe("getBreadcrumbItemProps", () => {
    it("returns props for non-active item with href", () => {
      const item: BreadcrumbItem = { label: "Home", href: "/" };
      const props = getBreadcrumbItemProps(item, false);

      expect(props.linkAs).toBeTruthy(); // Should be Link component
      expect(props.linkProps).toEqual({
        to: "/",
        "aria-label": "Home",
      });
      expect(props.active).toBe(false);
      expect(props["aria-current"]).toBeUndefined();
    });

    it("returns props for active item (last item)", () => {
      const item: BreadcrumbItem = { label: "Current", href: "/current" };
      const props = getBreadcrumbItemProps(item, true);

      expect(props.linkAs).toBe("span");
      expect(props.linkProps).toEqual({});
      expect(props.active).toBe(true);
      expect(props["aria-current"]).toBe("page");
    });

    it("returns props for item marked as current", () => {
      const item: BreadcrumbItem = {
        label: "Current",
        href: "/current",
        isCurrent: true,
      };
      const props = getBreadcrumbItemProps(item, false);

      expect(props.linkAs).toBe("span");
      expect(props.linkProps).toEqual({});
      expect(props.active).toBe(true);
      expect(props["aria-current"]).toBe("page");
    });

    it("returns props for item without href", () => {
      const item: BreadcrumbItem = { label: "No Link" };
      const props = getBreadcrumbItemProps(item, false);

      expect(props.linkAs).toBe("span");
      expect(props.linkProps).toEqual({});
      expect(props.active).toBe(false);
      expect(props["aria-current"]).toBeUndefined();
    });

    it("prioritizes isCurrent over isLast", () => {
      const item: BreadcrumbItem = {
        label: "Current",
        href: "/current",
        isCurrent: true,
      };
      const props = getBreadcrumbItemProps(item, false);

      expect(props.active).toBe(true);
      expect(props["aria-current"]).toBe("page");
    });

    it("handles item with empty href", () => {
      const item: BreadcrumbItem = { label: "Empty Href", href: "" };
      const props = getBreadcrumbItemProps(item, false);

      // Empty href should be treated as no href
      expect(props.linkAs).toBe("span");
      expect(props.linkProps).toEqual({});
    });

    it("handles item with only whitespace href", () => {
      const item: BreadcrumbItem = { label: "Whitespace Href", href: "   " };
      const props = getBreadcrumbItemProps(item, false);

      // Whitespace href should still create a link
      expect(props.linkAs).toBeTruthy(); // Should be Link component
      expect(props.linkProps).toEqual({
        to: "   ",
        "aria-label": "Whitespace Href",
      });
    });

    it("handles complex href paths", () => {
      const item: BreadcrumbItem = {
        label: "Complex Path",
        href: "/path/with/multiple/segments?query=value&other=param#anchor",
      };
      const props = getBreadcrumbItemProps(item, false);

      expect(props.linkProps).toEqual({
        to: "/path/with/multiple/segments?query=value&other=param#anchor",
        "aria-label": "Complex Path",
      });
    });

    it("handles special characters in label for aria-label", () => {
      const item: BreadcrumbItem = {
        label: 'Special & Characters "Test"',
        href: "/special",
      };
      const props = getBreadcrumbItemProps(item, false);

      expect(props.linkProps).toEqual({
        to: "/special",
        "aria-label": 'Special & Characters "Test"',
      });
    });
  });

  describe("getBreadcrumbKey", () => {
    it("uses href as key when available", () => {
      const item: BreadcrumbItem = { label: "Home", href: "/" };
      const key = getBreadcrumbKey(item, 0);
      expect(key).toBe("/");
    });

    it("uses index-based key when href is not available", () => {
      const item: BreadcrumbItem = { label: "No Href" };
      const key = getBreadcrumbKey(item, 2);
      expect(key).toBe("breadcrumb-2");
    });

    it("uses href even when empty string", () => {
      const item: BreadcrumbItem = { label: "Empty Href", href: "" };
      const key = getBreadcrumbKey(item, 1);
      expect(key).toBe("");
    });

    it("handles complex href as key", () => {
      const item: BreadcrumbItem = {
        label: "Complex",
        href: "/path/with/segments?query=value#anchor",
      };
      const key = getBreadcrumbKey(item, 0);
      expect(key).toBe("/path/with/segments?query=value#anchor");
    });

    it("generates unique keys for different indices", () => {
      const item: BreadcrumbItem = { label: "No Href" };
      const key1 = getBreadcrumbKey(item, 0);
      const key2 = getBreadcrumbKey(item, 1);
      const key3 = getBreadcrumbKey(item, 2);

      expect(key1).toBe("breadcrumb-0");
      expect(key2).toBe("breadcrumb-1");
      expect(key3).toBe("breadcrumb-2");

      // Ensure they're all different
      expect(new Set([key1, key2, key3]).size).toBe(3);
    });

    it("handles negative indices", () => {
      const item: BreadcrumbItem = { label: "Negative Index" };
      const key = getBreadcrumbKey(item, -1);
      expect(key).toBe("breadcrumb--1");
    });

    it("handles large indices", () => {
      const item: BreadcrumbItem = { label: "Large Index" };
      const key = getBreadcrumbKey(item, 99999);
      expect(key).toBe("breadcrumb-99999");
    });

    it("prefers href over index even for index 0", () => {
      const item: BreadcrumbItem = { label: "Home", href: "/home" };
      const key = getBreadcrumbKey(item, 0);
      expect(key).toBe("/home");
    });

    it("handles href with special characters", () => {
      const item: BreadcrumbItem = {
        label: "Special",
        href: "/path with spaces/and&symbols?q=test%20value",
      };
      const key = getBreadcrumbKey(item, 0);
      expect(key).toBe("/path with spaces/and&symbols?q=test%20value");
    });
  });

  describe("Integration tests", () => {
    it("all helpers work together for complete breadcrumb item processing", () => {
      const items: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Category", href: "/category" },
        { label: "Current Page", isCurrent: true },
      ];

      items.forEach((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        // Test label rendering
        const label = renderBreadcrumbLabel(item, true, isFirst);

        // Test props generation
        const props = getBreadcrumbItemProps(item, isLast);

        // Test key generation
        const key = getBreadcrumbKey(item, index);

        // Verify the results make sense together
        if (isFirst) {
          // First item should show home icon
          expect(typeof label).not.toBe("string");
        } else {
          // Other items should show text labels
          expect(label).toBe(item.label);
        }

        if (item.isCurrent || isLast) {
          // Current items should be active
          expect(props.active).toBe(true);
          expect(props["aria-current"]).toBe("page");
        }

        // Key should be unique and predictable
        expect(key).toBeTruthy();
        if (item.href) {
          expect(key).toBe(item.href);
        } else {
          expect(key).toBe(`breadcrumb-${index}`);
        }
      });
    });
  });
});
