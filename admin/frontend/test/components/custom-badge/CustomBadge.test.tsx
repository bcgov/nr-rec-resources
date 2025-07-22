import { CustomBadge } from "@/components/custom-badge";
import { render, screen } from "@testing-library/react";

describe("CustomBadge", () => {
  it("renders the label with correct styles", () => {
    render(
      <CustomBadge label="Test Badge" bgColor="#123456" textColor="#abcdef" />,
    );
    const badge = screen.getByText("Test Badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: "#123456", color: "#abcdef" });
    expect(badge).toHaveClass("custom-badge");
  });
});
