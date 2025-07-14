import { render, screen, fireEvent, act } from "@testing-library/react";
import { NotificationBar } from "@/components/notification-bar/NotificationBar";
import * as notificationStoreModule from "@/store/notificationStore";
import React from "react";

// Helper to update the store
function setMessages(messages: any[]) {
  notificationStoreModule.notificationStore.setState({ messages });
}

describe("NotificationBar", () => {
  beforeEach(() => {
    setMessages([]);
  });

  it("renders nothing when there are no messages", () => {
    render(<NotificationBar />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("renders a notification message", () => {
    setMessages([{ id: 1, message: "Test message", variant: "success" }]);
    render(<NotificationBar />);
    expect(screen.getByText("Test message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("alert");
  });

  it("calls removeNotification when close button is clicked", () => {
    const spy = vi.spyOn(notificationStoreModule, "removeNotification");
    setMessages([{ id: 2, message: "Dismiss me", variant: "danger" }]);
    render(<NotificationBar />);
    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it("auto-dismisses a message after timeout", () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(notificationStoreModule, "removeNotification");
    setMessages([
      { id: 3, message: "Auto-dismiss", variant: "info", timeout: 1000 },
    ]);
    render(<NotificationBar />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(spy).toHaveBeenCalledWith(3);
    vi.useRealTimers();
  });

  it("does not auto-dismiss if autoDismiss is false", () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(notificationStoreModule, "removeNotification");
    setMessages([
      { id: 4, message: "Persistent", variant: "warning", autoDismiss: false },
    ]);
    render(<NotificationBar />);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(spy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
