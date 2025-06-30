import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { GalleryAccordion } from "@/pages/rec-resource-page/components/RecResourceFileSection/GalleryAccordion";

const items = [
  { id: 1, name: "File 1" },
  { id: 2, name: "File 2" },
];

describe("GalleryAccordion", () => {
  it("renders title and item count", () => {
    render(
      <GalleryAccordion
        eventKey="test"
        title="Test Files"
        description="Test description"
        items={items}
        renderItem={(item) => <div>{item.name}</div>}
      />,
    );
    expect(screen.getByText(/Test Files \(2\)/)).toBeInTheDocument();
  });

  it("renders description banner", () => {
    render(
      <GalleryAccordion
        eventKey="test"
        title="Test Files"
        description="Test description"
        items={items}
        renderItem={(item) => <div>{item.name}</div>}
      />,
    );
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders all items using renderItem", () => {
    render(
      <GalleryAccordion
        eventKey="test"
        title="Test Files"
        description="desc"
        items={items}
        renderItem={(item) => <div>{item.name}</div>}
      />,
    );
    expect(screen.getByText("File 1")).toBeInTheDocument();
    expect(screen.getByText("File 2")).toBeInTheDocument();
  });

  it("renders upload tile with label and triggers onUploadClick", () => {
    const onFileUploadTileClick = vi.fn();
    render(
      <GalleryAccordion
        eventKey="test"
        title="Test Files"
        description="desc"
        items={[]}
        renderItem={() => null}
        uploadLabel="Upload Here"
        onFileUploadTileClick={onFileUploadTileClick}
      />,
    );
    const uploadBtn = screen.getByText("Upload Here");
    expect(uploadBtn).toBeInTheDocument();
    fireEvent.click(uploadBtn);
    expect(onFileUploadTileClick).toHaveBeenCalled();
  });

  it("shows spinner when loading", () => {
    render(
      <GalleryAccordion
        eventKey="test"
        title="Test Files"
        description="desc"
        items={[]}
        renderItem={() => null}
        isLoading={true}
      />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
