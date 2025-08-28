import { RecResourceOverviewSection } from "@/pages/rec-resource-page/components/RecResourceOverviewSection/RecResourceOverviewSection";
import { render, screen } from "@testing-library/react";

describe("RecResourceOverviewSection", () => {
  const recResource = {
    description: "<b>Test Description</b>",
    closest_community: "Test Community",
    recreation_district_description: "Test District",
    recreation_access: [
      {
        description: "Road",
        sub_access_code: "4W",
        sub_access_description: "4 wheel drive",
      },
      {
        description: "Trail",
        sub_access_code: undefined,
        sub_access_description: undefined,
      },
    ],
    maintenance_standard_description: "Test Maintenance",
    driving_directions: "<i>Test Directions</i>",
  } as any;

  it("renders all overview items", () => {
    render(<RecResourceOverviewSection recResource={recResource} />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Closest Community")).toBeInTheDocument();
    expect(screen.getByText("Recreation District")).toBeInTheDocument();
    expect(screen.getByText("Access Type")).toBeInTheDocument();
    expect(screen.getByText("Maintenance Type")).toBeInTheDocument();
    expect(screen.getByText("Driving Directions")).toBeInTheDocument();
    expect(screen.getByText("Test Community")).toBeInTheDocument();
    expect(screen.getByText("Test District")).toBeInTheDocument();
    expect(screen.getByText("Test Maintenance")).toBeInTheDocument();
    // Recreation access with sub access
    expect(screen.getByText("Road")).toBeInTheDocument();
    expect(screen.getByText("(4 wheel drive)")).toBeInTheDocument();
    expect(screen.getByText("Trail")).toBeInTheDocument();
    // HTML content
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Directions")).toBeInTheDocument();
  });

  it("renders recreation access without sub access", () => {
    const recResourceWithoutSubAccess = {
      ...recResource,
      recreation_access: [
        {
          description: "Road",
          sub_access_code: undefined,
          sub_access_description: undefined,
        },
      ],
    } as any;

    render(
      <RecResourceOverviewSection recResource={recResourceWithoutSubAccess} />,
    );
    expect(screen.getByText("Road")).toBeInTheDocument();
    expect(screen.queryByText("(4 wheel drive)")).not.toBeInTheDocument();
  });

  it("handles empty recreation access array", () => {
    const recResourceEmptyAccess = {
      ...recResource,
      recreation_access: [],
    } as any;

    render(<RecResourceOverviewSection recResource={recResourceEmptyAccess} />);
    // With empty recreation access, the Access Type section should not be rendered
    expect(screen.queryByText("Access Type")).not.toBeInTheDocument();
  });
});
