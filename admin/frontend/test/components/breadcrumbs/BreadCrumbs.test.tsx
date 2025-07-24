import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BreadCrumbs from "../../../src/components/breadcrumbs/BreadCrumbs";

describe("BreadCrumbs", () => {
  it("renders breadcrumb with default links and current path", () => {
    render(<BreadCrumbs recResourceName="Resource Name" />);

    expect(screen.getByAltText("Home icon")).toBeInTheDocument();
    expect(screen.getByAltText("chevron icon")).toBeInTheDocument();
    expect(screen.getByText("Resource Name")).toBeInTheDocument();
  });
});
