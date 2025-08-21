import { RecResourceOverviewSection } from "@/pages/rec-resource-page/components/RecResourceOverviewSection/RecResourceOverviewSection";
import { render, screen } from "@testing-library/react";

describe("RecResourceOverviewSection", () => {
  const recResource = {
    description: "<b>Test Description</b>",
    closest_community: "Test Community",
    recreation_district_description: "Test District",
    rec_resource_type: "Test Access Type",
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
    expect(screen.getByText("Test Access Type")).toBeInTheDocument();
    expect(screen.getByText("Test Maintenance")).toBeInTheDocument();
    // HTML content
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Test Directions")).toBeInTheDocument();
  });
});
