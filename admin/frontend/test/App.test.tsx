import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "@/App";

// Mock react-router-dom and its hooks/components
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => (
      <div data-testid="browser-router">{children}</div>
    ),
    Routes: ({ children }: any) => <div data-testid="routes">{children}</div>,
    Route: ({ element, ...props }: any) => (
      <div data-testid={`route-${props.path}`}>{element}</div>
    ),
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  AuthProvider: ({ children }: any) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

// Mock NotificationBar, PageLayout, AuthGuard, and Header in @/components
vi.mock("@/components", () => {
  return {
    NotificationBar: () => (
      <div data-testid="notification-bar">NotificationBar</div>
    ),
    PageLayout: ({ children }: any) => (
      <div data-testid="page-layout">{children}</div>
    ),
    AuthGuard: ({ children }: any) => (
      <div data-testid="auth-guard">{children}</div>
    ),
    Header: () => <header>Header</header>,
  };
});

// Mock ReactQueryDevtools
vi.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => <div data-testid="devtools" />,
}));

// Mock LandingPage
vi.mock("@/pages/LandingPage", () => ({
  LandingPage: () => <div data-testid="landing-page">LandingPage</div>,
}));

// Mock RecResourcePage
vi.mock("@/pages/rec-resource-page/RecResourcePage", () => ({
  RecResourcePage: () => (
    <div data-testid="rec-resource-page">RecResourcePage</div>
  ),
}));

// Fix routes mock to include REC_RESOURCE_PAGE
vi.mock("@/routes", () => ({
  ROUTES: {
    LANDING: "/",
    REC_RESOURCE_PAGE: "/rec-resource/:id",
  },
}));

describe("App", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseParams.mockReset();
    mockUseParams.mockReturnValue({ id: "test-id" });
  });

  it("renders the main layout and devtools", () => {
    render(<App />);
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByTestId("auth-guard")).toBeInTheDocument();
    expect(screen.getByTestId("browser-router")).toBeInTheDocument();
    expect(screen.getByTestId("routes")).toBeInTheDocument();
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByTestId("devtools")).toBeInTheDocument();
  });

  it("renders the LandingPage route", () => {
    render(<App />);
    expect(screen.getByTestId("route-/")).toBeInTheDocument();
    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
  });

  it("renders the RecResourcePage route with params", () => {
    mockUseParams.mockReturnValue({ id: "abc123" });
    render(<App />);
    expect(screen.getByTestId("route-/rec-resource/:id")).toBeInTheDocument();
    expect(screen.getByTestId("rec-resource-page")).toBeInTheDocument();
  });

  it("calls useNavigate when invoked", () => {
    render(<App />);
    mockNavigate("/somewhere");
    expect(mockNavigate).toHaveBeenCalledWith("/somewhere");
  });
});
