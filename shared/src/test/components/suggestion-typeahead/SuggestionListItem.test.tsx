import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuggestionListItem } from "@shared/components/suggestion-typeahead/SuggestionListItem";

// Mock react-bootstrap-typeahead Highlighter
vi.mock("react-bootstrap-typeahead", () => ({
  Highlighter: ({ children }: any) => (
    <mark data-testid="highlighter">{children}</mark>
  ),
}));

const defaultProps = {
  searchTerm: "Park",
  rec_resource_id: "R-1234",
  icon: <div data-testid="icon" />,
  title: "Riverfront Park",
  resourceType: "Urban Park",
  district: "Downtown",
};

describe("SuggestionListItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders icon, title, resourceType, district, and rec_resource_id badges", () => {
    render(<SuggestionListItem {...defaultProps} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    const highlighters = screen.getAllByTestId("highlighter");
    expect(highlighters.length).toBe(2);
    highlighters.forEach((h) => expect(h).toHaveTextContent("Riverfront Park"));
    expect(screen.getByText("Urban Park • Downtown")).toBeInTheDocument();
    const badges = screen.getAllByText("R-1234");
    expect(badges.length).toBe(2);
    badges.forEach((badge) =>
      expect(badge.className).toContain("rec-id-badge"),
    );
  });

  it("renders ListGroup.Item with action and correct classes", () => {
    const { container } = render(<SuggestionListItem {...defaultProps} />);
    const item = container.querySelector(".list-group-item");
    expect(item).toBeInTheDocument();
    expect(item?.className).toContain("action");
    expect(item?.className).toContain("list-group-item");
  });

  it("renders mobile and desktop badge locations", () => {
    render(<SuggestionListItem {...defaultProps} />);
    const badges = screen.getAllByText("R-1234");
    // First badge is mobile, second is desktop
    expect(badges[0].className).toContain("rec-id-badge");
    expect(badges[1].className).toContain("rec-id-badge");
  });

  it("renders Highlighter with correct children and search term", () => {
    render(<SuggestionListItem {...defaultProps} />);
    const marks = screen.getAllByTestId("highlighter");
    expect(marks.length).toBe(2);
    marks.forEach((mark) => expect(mark).toHaveTextContent("Riverfront Park"));
  });

  it("renders correct resourceType and district", () => {
    render(<SuggestionListItem {...defaultProps} />);
    expect(screen.getByText("Urban Park • Downtown")).toBeInTheDocument();
  });

  it("renders with different props", () => {
    const props = {
      searchTerm: "Lake",
      rec_resource_id: "R-9999",
      icon: <span data-testid="icon2" />,
      title: "Crystal Lake",
      resourceType: "Lake",
      district: "Northside",
    };
    render(<SuggestionListItem {...props} />);
    expect(screen.getByTestId("icon2")).toBeInTheDocument();
    const highlighters = screen.getAllByTestId("highlighter");
    expect(highlighters.length).toBe(2);
    highlighters.forEach((h) => expect(h).toHaveTextContent("Crystal Lake"));
    expect(screen.getByText("Lake • Northside")).toBeInTheDocument();
    expect(screen.getAllByText("R-9999").length).toBe(2);
  });
});
