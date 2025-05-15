import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

// Mock dependencies
vi.mock("~/react-router-dom", () => ({
  BrowserRouter: ({ children }: any) => (
    <div data-testid="browser-router">{children}</div>
  ),
  Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: any) => element,
}));
vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: any) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));
vi.mock("~/@bcgov/design-system-react-components", () => ({
  Footer: () => <footer>Footer</footer>,
}));
vi.mock("@/components/header", () => ({
  Header: () => <header>Header</header>,
}));
vi.mock("@/components/auth", () => ({
  AuthGuard: ({ children }: any) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}));

describe("App", () => {
  it("renders the main layout and content", () => {
    render(<App />);
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("auth-guard")).toBeInTheDocument();
    expect(screen.getByTestId("browser-router")).toBeInTheDocument();
    expect(screen.getByTestId("routes")).toBeInTheDocument();
    expect(screen.getByText("RST Admin")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
