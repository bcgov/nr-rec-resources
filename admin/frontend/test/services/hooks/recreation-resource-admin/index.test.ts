import * as recreationResourceAdminIndex from "@/services/hooks/recreation-resource-admin/index";
import { describe, expect, it } from "vitest";

describe("services/hooks/recreation-resource-admin/index", () => {
  it("exports all recreation resource admin hooks", () => {
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useDeleteResourceDocument",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useDeleteResourceImage",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useGetDocumentsByRecResourceId",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useGetImagesByRecResourceId",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useGetRecreationResourceById",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useGetRecreationResourceSuggestions",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useRecreationResourceAdminApiClient",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useUploadResourceDocument",
    );
    expect(recreationResourceAdminIndex).toHaveProperty(
      "useUploadResourceImage",
    );
  });

  it("exports helpers", () => {
    expect(recreationResourceAdminIndex).toHaveProperty("createRetryHandler");
    expect(recreationResourceAdminIndex).toHaveProperty(
      "mapRecreationResourceDetail",
    );
  });

  it("all exports are functions", () => {
    expect(typeof recreationResourceAdminIndex.useDeleteResourceDocument).toBe(
      "function",
    );
    expect(typeof recreationResourceAdminIndex.useDeleteResourceImage).toBe(
      "function",
    );
    expect(
      typeof recreationResourceAdminIndex.useGetDocumentsByRecResourceId,
    ).toBe("function");
    expect(
      typeof recreationResourceAdminIndex.useGetImagesByRecResourceId,
    ).toBe("function");
    expect(
      typeof recreationResourceAdminIndex.useGetRecreationResourceById,
    ).toBe("function");
    expect(
      typeof recreationResourceAdminIndex.useGetRecreationResourceSuggestions,
    ).toBe("function");
    expect(
      typeof recreationResourceAdminIndex.useRecreationResourceAdminApiClient,
    ).toBe("function");
    expect(typeof recreationResourceAdminIndex.useUploadResourceDocument).toBe(
      "function",
    );
    expect(typeof recreationResourceAdminIndex.useUploadResourceImage).toBe(
      "function",
    );
    expect(typeof recreationResourceAdminIndex.createRetryHandler).toBe(
      "function",
    );
    expect(
      typeof recreationResourceAdminIndex.mapRecreationResourceDetail,
    ).toBe("function");
  });
});
