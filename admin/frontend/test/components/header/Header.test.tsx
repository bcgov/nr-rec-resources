import { Header } from "@/components/header";
import { useAuthContext } from "@/contexts/AuthContext";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLogout = vi.fn();
const mockGetUserFullName = vi.fn(() => "TEST USER");
vi.mock("@/services/auth", () => ({
  logout: () => mockLogout(),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(() => ({
    user: { idir_username: "TEST_USER" },
    authService: { logout: mockLogout, getUserFullName: mockGetUserFullName },
  })),
}));
vi.mock("@/components/avatar/Avatar", () => ({
  Avatar: vi.fn(({ name, size, tooltip }) => (
    <div
      data-testid="mock-avatar"
      data-name={name}
      data-size={size}
      data-tooltip={tooltip ? "true" : "false"}
    />
  )),
}));
vi.mock("@/hooks/useMediaQuery");

describe("Header", () => {
  beforeEach(() => {
    mockLogout.mockClear();
    (useAuthContext as any).mockClear();
    (useAuthContext as any).mockImplementation(() => ({
      user: { idir_username: "TEST_USER" },
      authService: { logout: mockLogout, getUserFullName: mockGetUserFullName },
    }));
    // reset viewport to desktop
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));
  });

  const renderHeader = () => render(<Header />);

  it("renders the header with user display name", () => {
    renderHeader();
    expect(screen.getByText("TEST USER")).toBeInTheDocument();
    // Verify Avatar is rendered with correct props
    const avatar = screen.getByTestId("mock-avatar");
    expect(avatar).toHaveAttribute("data-name", "TEST USER");
    expect(avatar).toHaveAttribute("data-size", "50");
    expect(avatar).toHaveAttribute("data-tooltip", "false");
  });

  it("calls logout when Logout is clicked", () => {
    renderHeader();
    fireEvent.click(screen.getByTestId("menu-toggle"));
    fireEvent.click(screen.getByText("Logout"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("does not render welcome message if user is not present", () => {
    (useAuthContext as any).mockImplementationOnce(() => ({
      user: undefined,
      authService: { logout: mockLogout, getUserFullName: mockGetUserFullName },
    }));
    renderHeader();
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it("renders with a different user name", () => {
    (useAuthContext as any).mockImplementationOnce(() => ({
      user: { idir_username: "Alice" },
      authService: {
        logout: mockLogout,
        getUserFullName: vi.fn(() => "Alice"),
      },
    }));
    renderHeader();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders mobile view with external welcome message hidden and dropdown showing signed in info", () => {
    // simulate mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.dispatchEvent(new Event("resize"));

    renderHeader();

    // verify that the external welcome message is hidden
    const externalWelcome = screen.getByText("TEST USER");
    expect(externalWelcome).toHaveClass("d-none");

    // open dropdown to check mobile-specific login message
    fireEvent.click(screen.getByTestId("menu-toggle"));
    expect(screen.getByText("Signed in as TEST_USER")).toBeInTheDocument();
  });

  it.each([
    { key: "Enter", code: "Enter", charCode: 13 },
    { key: " ", code: "Space", charCode: 32 },
  ])(
    "opens dropdown and calls logout when menu toggle is activated by $key keydown",
    ({ key, code, charCode }) => {
      renderHeader();
      const menuToggle = screen.getByTestId("menu-toggle");

      // Ensure menu toggle is focusable
      expect(menuToggle).toHaveAttribute("tabindex", "0");

      // Simulate keyboard activation
      fireEvent.keyDown(menuToggle, { key, code, charCode });

      // Dropdown should be open, "Logout" should be visible
      const logoutButton = screen.getByText("Logout");
      expect(logoutButton).toBeVisible();

      // Simulate clicking logout
      fireEvent.click(logoutButton);
      expect(mockLogout).toHaveBeenCalled();
    },
  );
});
