import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Header } from "@/components/header";

const mockLogout = vi.fn();
vi.mock("@/services/auth", () => ({
  logout: () => mockLogout(),
}));
vi.mock("@/contexts/AuthContext", () => ({
  useAuthContext: vi.fn(() => ({
    user: { idir_username: "TEST_USER" },
    authService: { logout: mockLogout },
  })),
}));

describe("Header", () => {
  beforeEach(() => {
    mockLogout.mockClear();
    (useAuthContext as any).mockClear();
    (useAuthContext as any).mockImplementation(() => ({
      user: { idir_username: "TEST_USER" },
      authService: { logout: mockLogout },
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
    expect(screen.getByText("Welcome, TEST_USER")).toBeInTheDocument();
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
      authService: { logout: mockLogout },
    }));
    renderHeader();
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
  });

  it("renders with a different user name", () => {
    (useAuthContext as any).mockImplementationOnce(() => ({
      user: { idir_username: "Alice" },
      authService: { logout: mockLogout },
    }));
    renderHeader();
    expect(screen.getByText("Welcome, Alice")).toBeInTheDocument();
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
    const externalWelcome = screen.getByText("Welcome, TEST_USER");
    expect(externalWelcome).toHaveClass("d-none");

    // open dropdown to check mobile-specific login message
    fireEvent.click(screen.getByTestId("menu-toggle"));
    expect(screen.getByText("Signed in as TEST_USER")).toBeInTheDocument();
  });
});
