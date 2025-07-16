import { render, screen } from "@testing-library/react";
import { SuggestionMenu } from "@shared/components/suggestion-typeahead/SuggestionMenu";
import type { RenderMenuProps } from "react-bootstrap-typeahead";
import { RESOURCE_TYPE_ICONS } from "@shared/components/suggestion-typeahead/constants";

// Mock SuggestionListItem
vi.mock("@shared/components/suggestion-typeahead/SuggestionListItem", () => ({
  SuggestionListItem: ({
    searchTerm,
    district,
    icon,
    rec_resource_id,
    resourceType,
    title,
  }: any) => {
    // If icon is a React element (Image), extract its src prop for test output
    let iconSrc = "";
    if (icon && icon.props && icon.props.src) {
      iconSrc = icon.props.src;
    }
    return (
      <div data-testid="suggestion-item">
        {title} | {district} | {resourceType} | {iconSrc} | {searchTerm} |{" "}
        {rec_resource_id}
      </div>
    );
  },
}));

describe("SuggestionMenu", () => {
  const mockResults = [
    {
      rec_resource_id: "abc123",
      recreation_resource_type_code: "RTR",
      recreation_resource_type: "Trail",
      district_description: "Mountain District",
      name: "Alpine Loop",
    },
    {
      rec_resource_id: "def456",
      recreation_resource_type_code: "SIT",
      recreation_resource_type: "Campground",
      district_description: "Valley District",
      name: "Sunset Camp",
    },
  ];

  const mockMenuProps: RenderMenuProps = {
    innerRef: vi.fn(),
    style: {},
    className: "custom-class",
    role: "listbox",
  };

  it("renders a Menu with the correct number of MenuItems", () => {
    render(
      <SuggestionMenu
        results={mockResults}
        searchTerm="loop"
        menuProps={mockMenuProps}
      />,
    );

    const menuItems = screen.getAllByTestId("suggestion-item");
    expect(menuItems).toHaveLength(mockResults.length);

    // Basic content check
    expect(menuItems[0]).toHaveTextContent("Alpine Loop");
    expect(menuItems[1]).toHaveTextContent("Sunset Camp");
  });

  it("renders each MenuItem with correct props", () => {
    render(
      <SuggestionMenu
        results={mockResults}
        searchTerm="camp"
        menuProps={mockMenuProps}
      />,
    );

    const items = screen.getAllByTestId("suggestion-item");
    expect(items[0]).toHaveTextContent(
      `Alpine Loop | Mountain District | Trail | ${RESOURCE_TYPE_ICONS.RTR} | camp | abc123`,
    );
    expect(items[1]).toHaveTextContent(
      `Sunset Camp | Valley District | Campground | ${RESOURCE_TYPE_ICONS.SIT} | camp | def456`,
    );
  });

  it("passes down menuProps to Menu component", () => {
    const { container } = render(
      <SuggestionMenu results={[]} searchTerm="" menuProps={mockMenuProps} />,
    );

    const menu = container.querySelector(".custom-class");
    expect(menu).toBeInTheDocument();
    expect(menu?.getAttribute("role")).toBe("listbox");
  });

  it("renders empty Menu when results are empty", () => {
    render(
      <SuggestionMenu
        results={[]}
        searchTerm="test"
        menuProps={mockMenuProps}
      />,
    );
    expect(screen.queryByTestId("suggestion-item")).not.toBeInTheDocument();
  });
});
