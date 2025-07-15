import { NotificationBarIcon } from "@/components/notification-bar/NotificationBarIcon";
import { NotificationMessage } from "@/store/notificationStore";
import { cleanup, render, screen } from "@testing-library/react";

afterEach(cleanup);

describe("NotificationBarIcon", () => {
  it("renders spinner icon for spinner type", () => {
    const msg: NotificationMessage = {
      id: 1,
      type: "spinner",
      message: "Loading...",
      autoDismiss: false,
    };
    render(<NotificationBarIcon msg={msg} />);
    expect(screen.getByTestId("notification-spinner")).toBeInTheDocument();
    expect(screen.getByTestId("notification-spinner")).toHaveClass(
      "notification-bar-container__spinner",
    );
  });

  ["success", "danger", "warning", "info"].forEach((variant) => {
    it(`renders correct FontAwesome icon for status type and variant '${variant}'`, () => {
      const msg: NotificationMessage = {
        id: variant,
        type: "status",
        message: `${variant} message`,
        variant: variant as any,
        autoDismiss: true,
      };
      render(<NotificationBarIcon msg={msg} />);
      expect(screen.getByTestId("notification-icon")).toBeInTheDocument();
    });
  });

  it("renders nothing for unknown type", () => {
    const msg = {
      id: 2,
      type: "other",
      message: "Other message",
      autoDismiss: true,
    } as unknown as NotificationMessage;
    const { container } = render(<NotificationBarIcon msg={msg} />);
    expect(container.firstChild).toBeNull();
  });
});
