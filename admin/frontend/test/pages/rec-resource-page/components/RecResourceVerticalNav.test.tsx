import { RecResourceVerticalNav } from "@/pages/rec-resource-page/components/RecResourceVerticalNav";
import { RecResourceTabKey } from "@/pages/rec-resource-page/constants";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("RecResourceVerticalNav", () => {
  const defaultProps = {
    activeTab: RecResourceTabKey.OVERVIEW,
    resourceId: "test-resource-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all navigation items", () => {
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Files")).toBeInTheDocument();
  });

  it("highlights the active tab", () => {
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    const overviewLink = screen.getByText("Overview").closest(".nav-link");
    expect(overviewLink).toHaveClass("active");

    const filesLink = screen.getByText("Files").closest(".nav-link");
    expect(filesLink).not.toHaveClass("active");
  });

  it("navigates to correct route when tab is clicked", async () => {
    const user = userEvent.setup();
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    const filesLink = screen.getByText("Files");
    await user.click(filesLink);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/rec-resource/test-resource-123/files",
    );
  });

  it("renders with files tab active", () => {
    renderWithRouter(
      <RecResourceVerticalNav
        {...defaultProps}
        activeTab={RecResourceTabKey.FILES}
      />,
    );

    const overviewLink = screen.getByText("Overview").closest(".nav-link");
    expect(overviewLink).not.toHaveClass("active");

    const filesLink = screen.getByText("Files").closest(".nav-link");
    expect(filesLink).toHaveClass("active");
  });
});
