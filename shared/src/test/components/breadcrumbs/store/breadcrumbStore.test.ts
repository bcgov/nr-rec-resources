import { describe, it, expect, beforeEach } from "vitest";
import {
  breadcrumbStore,
  BreadcrumbItem,
  setBreadcrumbs,
} from "@shared/components/breadcrumbs";

describe("Breadcrumb Store", () => {
  beforeEach(() => {
    // Reset store state before each test
    breadcrumbStore.setState(() => ({
      items: [],
      previousRoute: undefined,
    }));
  });

  describe("Initial State", () => {
    it("has empty initial state", () => {
      const state = breadcrumbStore.getState();
      expect(state.items).toEqual([]);
      expect(state.previousRoute).toBeUndefined();
    });
  });

  describe("setState", () => {
    it("updates state using updater function", () => {
      const newItems: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Test", isCurrent: true },
      ];

      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: newItems,
      }));

      const state = breadcrumbStore.getState();
      expect(state.items).toEqual(newItems);
    });

    it("preserves other state properties when updating", () => {
      // Set initial state
      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: [{ label: "Initial", href: "/" }],
        previousRoute: "/previous",
      }));

      // Update only items
      const newItems: BreadcrumbItem[] = [
        { label: "Updated", href: "/updated" },
      ];

      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: newItems,
      }));

      const state = breadcrumbStore.getState();
      expect(state.items).toEqual(newItems);
      expect(state.previousRoute).toBe("/previous");
    });

    it("can update previousRoute", () => {
      breadcrumbStore.setState((prev) => ({
        ...prev,
        previousRoute: "/new-previous",
      }));

      const state = breadcrumbStore.getState();
      expect(state.previousRoute).toBe("/new-previous");
    });
  });

  describe("subscribe", () => {
    it("calls listener when state changes", () => {
      let callCount = 0;
      let lastState;

      const unsubscribe = breadcrumbStore.subscribe((state) => {
        callCount++;
        lastState = state;
      });

      expect(callCount).toBe(0);

      // Update state
      const newItems: BreadcrumbItem[] = [{ label: "Test", href: "/test" }];
      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: newItems,
      }));

      expect(callCount).toBe(1);
      expect(lastState).toEqual({
        items: newItems,
        previousRoute: undefined,
      });

      unsubscribe();
    });

    it("supports multiple listeners", () => {
      let call1Count = 0;
      let call2Count = 0;

      const unsubscribe1 = breadcrumbStore.subscribe(() => {
        call1Count++;
      });

      const unsubscribe2 = breadcrumbStore.subscribe(() => {
        call2Count++;
      });

      // Update state
      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: [{ label: "Test", href: "/test" }],
      }));

      expect(call1Count).toBe(1);
      expect(call2Count).toBe(1);

      unsubscribe1();
      unsubscribe2();
    });

    it("returns unsubscribe function that removes listener", () => {
      let callCount = 0;

      const unsubscribe = breadcrumbStore.subscribe(() => {
        callCount++;
      });

      // Update state - should trigger listener
      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: [{ label: "Test1", href: "/test1" }],
      }));

      expect(callCount).toBe(1);

      // Unsubscribe
      unsubscribe();

      // Update state again - should not trigger listener
      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: [{ label: "Test2", href: "/test2" }],
      }));

      expect(callCount).toBe(1); // Should still be 1
    });

    it("handles multiple subscriptions and unsubscriptions", () => {
      let call1Count = 0;
      let call2Count = 0;
      let call3Count = 0;

      const unsubscribe1 = breadcrumbStore.subscribe(() => call1Count++);
      const unsubscribe2 = breadcrumbStore.subscribe(() => call2Count++);
      const unsubscribe3 = breadcrumbStore.subscribe(() => call3Count++);

      // Update state
      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: [{ label: "Test", href: "/test" }],
      }));

      expect(call1Count).toBe(1);
      expect(call2Count).toBe(1);
      expect(call3Count).toBe(1);

      // Unsubscribe middle listener
      unsubscribe2();

      // Update state again
      breadcrumbStore.setState((prev) => ({
        ...prev,
        items: [{ label: "Test2", href: "/test2" }],
      }));

      expect(call1Count).toBe(2);
      expect(call2Count).toBe(1); // Should not have incremented
      expect(call3Count).toBe(2);

      unsubscribe1();
      unsubscribe3();
    });
  });

  describe("setBreadcrumbs helper function", () => {
    it("sets breadcrumb items using helper function", () => {
      const items: BreadcrumbItem[] = [
        { label: "Home", href: "/" },
        { label: "Current", isCurrent: true },
      ];

      setBreadcrumbs(items);

      const state = breadcrumbStore.getState();
      expect(state.items).toEqual(items);
    });

    it("replaces existing breadcrumb items", () => {
      // Set initial items
      const initialItems: BreadcrumbItem[] = [
        { label: "Initial", href: "/initial" },
      ];
      setBreadcrumbs(initialItems);

      // Verify initial state
      expect(breadcrumbStore.getState().items).toEqual(initialItems);

      // Set new items
      const newItems: BreadcrumbItem[] = [
        { label: "New Home", href: "/" },
        { label: "New Page", href: "/new" },
      ];
      setBreadcrumbs(newItems);

      // Verify state was replaced
      expect(breadcrumbStore.getState().items).toEqual(newItems);
    });

    it("can set empty breadcrumb array", () => {
      // Set some initial items
      setBreadcrumbs([{ label: "Test", href: "/test" }]);
      expect(breadcrumbStore.getState().items).toHaveLength(1);

      // Clear breadcrumbs
      setBreadcrumbs([]);
      expect(breadcrumbStore.getState().items).toEqual([]);
    });

    it("preserves previousRoute when setting breadcrumbs", () => {
      // Set initial state with previousRoute
      breadcrumbStore.setState((prev) => ({
        ...prev,
        previousRoute: "/previous-page",
      }));

      // Set breadcrumbs
      setBreadcrumbs([{ label: "New", href: "/new" }]);

      const state = breadcrumbStore.getState();
      expect(state.items).toEqual([{ label: "New", href: "/new" }]);
      expect(state.previousRoute).toBe("/previous-page");
    });

    it("triggers listeners when setting breadcrumbs", () => {
      let callCount = 0;
      let lastState;

      const unsubscribe = breadcrumbStore.subscribe((state) => {
        callCount++;
        lastState = state;
      });

      const items: BreadcrumbItem[] = [
        { label: "Listener Test", href: "/listener" },
      ];

      setBreadcrumbs(items);

      expect(callCount).toBe(1);
      expect(lastState).toEqual({
        items,
        previousRoute: undefined,
      });

      unsubscribe();
    });
  });

  describe("Complex state updates", () => {
    it("handles rapid state updates", () => {
      let updateCount = 0;
      const states: any[] = [];

      const unsubscribe = breadcrumbStore.subscribe((state) => {
        updateCount++;
        states.push({ ...state });
      });

      // Perform multiple rapid updates
      setBreadcrumbs([{ label: "Update 1", href: "/1" }]);
      setBreadcrumbs([{ label: "Update 2", href: "/2" }]);
      setBreadcrumbs([{ label: "Update 3", href: "/3" }]);

      expect(updateCount).toBe(3);
      expect(states).toHaveLength(3);
      expect(states[0].items[0].label).toBe("Update 1");
      expect(states[1].items[0].label).toBe("Update 2");
      expect(states[2].items[0].label).toBe("Update 3");

      unsubscribe();
    });

    it("handles concurrent listeners during updates", () => {
      let listener1Count = 0;
      let listener2Count = 0;

      const unsubscribe1 = breadcrumbStore.subscribe(() => {
        listener1Count++;
      });

      setBreadcrumbs([{ label: "Test", href: "/test" }]);

      const unsubscribe2 = breadcrumbStore.subscribe(() => {
        listener2Count++;
      });

      setBreadcrumbs([{ label: "Test 2", href: "/test2" }]);

      expect(listener1Count).toBe(2);
      expect(listener2Count).toBe(1);

      unsubscribe1();
      unsubscribe2();
    });
  });
});
