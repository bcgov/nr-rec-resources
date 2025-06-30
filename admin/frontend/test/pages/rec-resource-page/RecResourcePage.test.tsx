import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import * as Router from "react-router-dom";
import * as GetResource from "@/services/hooks/recreation-resource-admin/useGetRecreationResourceById";
import * as Store from "@/pages/rec-resource-page/store/recResourceDetailStore";
import * as Components from "@/pages/rec-resource-page/components";
import { RecResourcePage } from "@/pages/rec-resource-page";

vi.mock("react-router-dom", () => ({
  useParams: vi.fn(),
}));
vi.mock(
  "@/services/hooks/recreation-resource-admin/useGetRecreationResourceById",
  () => ({
    useGetRecreationResourceById: vi.fn(),
  }),
);
vi.mock("@/pages/rec-resource-page/store/recResourceDetailStore", () => ({
  setRecResourceDetail: vi.fn(),
}));
vi.mock("@/pages/rec-resource-page/components", () => ({
  RecResourcePageContent: vi.fn(() => <div>Mocked RecResourcePageContent</div>),
}));

describe("RecResourcePage", () => {
  const useParams = Router.useParams as Mock;
  const useGetRecreationResourceById =
    GetResource.useGetRecreationResourceById as Mock;
  const setRecResourceDetail = Store.setRecResourceDetail as Mock;
  const RecResourcePageContent = Components.RecResourcePageContent as Mock;

  beforeEach(() => {
    useParams.mockClear();
    useGetRecreationResourceById.mockClear();
    setRecResourceDetail.mockClear();
    RecResourcePageContent.mockClear();
  });

  it("should retrieve the ID from URL parameters and fetch recreation resource", () => {
    useParams.mockReturnValue({ id: "123" });
    useGetRecreationResourceById.mockReturnValue({ data: null });
    render(<RecResourcePage />);
    expect(useParams).toHaveBeenCalledTimes(1);
    expect(useGetRecreationResourceById).toHaveBeenCalledWith("123");
    expect(RecResourcePageContent).toHaveBeenCalledTimes(1);
  });

  it("should set the recreation resource detail in the store when data is available", () => {
    const mockRecResourceData = { id: "123", name: "Test Resource" };
    useParams.mockReturnValue({ id: "123" });
    useGetRecreationResourceById.mockReturnValue({ data: mockRecResourceData });
    render(<RecResourcePage />);
    expect(setRecResourceDetail).toHaveBeenCalledTimes(1);
    expect(setRecResourceDetail).toHaveBeenCalledWith(mockRecResourceData);
  });

  it("should not set the recreation resource detail if data is null", () => {
    useParams.mockReturnValue({ id: "456" });
    useGetRecreationResourceById.mockReturnValue({ data: null });
    render(<RecResourcePage />);
    expect(setRecResourceDetail).toHaveBeenCalledTimes(1);
    expect(setRecResourceDetail).toHaveBeenCalledWith(null);
  });

  it("should render RecResourcePageContent component", () => {
    useParams.mockReturnValue({ id: "789" });
    useGetRecreationResourceById.mockReturnValue({ data: null });
    render(<RecResourcePage />);
    expect(
      screen.getByText("Mocked RecResourcePageContent"),
    ).toBeInTheDocument();
    expect(RecResourcePageContent).toHaveBeenCalledTimes(1);
  });

  it("should call setRecResourceDetail with updated data when recResource changes", () => {
    const { rerender } = render(<RecResourcePage />);
    const initialData = { id: "1", name: "Resource A" };
    const updatedData = { id: "1", name: "Resource A Updated" };
    useParams.mockReturnValue({ id: "1" });
    useGetRecreationResourceById.mockReturnValue({ data: initialData });
    rerender(<RecResourcePage />);
    expect(setRecResourceDetail).toHaveBeenCalledWith(initialData);
    useGetRecreationResourceById.mockReturnValue({ data: updatedData });
    rerender(<RecResourcePage />);
    expect(setRecResourceDetail).toHaveBeenCalledWith(updatedData);
    expect(setRecResourceDetail).toHaveBeenCalledTimes(3);
  });
});
