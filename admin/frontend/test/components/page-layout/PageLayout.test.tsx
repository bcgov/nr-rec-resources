import { PageLayout } from "@/components/page-layout";
import { render, screen } from "@testing-library/react";

describe("PageLayout", () => {
  it("renders children and applies the correct class", () => {
    render(
      <PageLayout>
        <div>Test Content</div>
      </PageLayout>,
    );
    const layout = screen.getByText("Test Content").parentElement;
    expect(layout).toBeInTheDocument();
    expect(layout).toHaveClass("page-layout__container");
  });
});
