import * as hooksIndex from "@/services/hooks/index";
import { describe, expect, it } from "vitest";

describe("services/hooks/index", () => {
  it("exports recreation-resource-admin hooks", () => {
    expect(hooksIndex).toHaveProperty("useDeleteResourceDocument");
    expect(hooksIndex).toHaveProperty("useDeleteResourceImage");
    expect(hooksIndex).toHaveProperty("useGetDocumentsByRecResourceId");
    expect(hooksIndex).toHaveProperty("useGetImagesByRecResourceId");
    expect(hooksIndex).toHaveProperty("useGetRecreationResourceById");
    expect(hooksIndex).toHaveProperty("useGetRecreationResourceSuggestions");
    expect(hooksIndex).toHaveProperty("useRecreationResourceAdminApiClient");
    expect(hooksIndex).toHaveProperty("useUploadResourceDocument");
    expect(hooksIndex).toHaveProperty("useUploadResourceImage");
    expect(hooksIndex).toHaveProperty("createRetryHandler");
  });

  it("exports useGlobalQueryErrorHandler", () => {
    expect(hooksIndex).toHaveProperty("useGlobalQueryErrorHandler");
  });

  it("module exports are functions", () => {
    expect(typeof hooksIndex.useGlobalQueryErrorHandler).toBe("function");
    expect(typeof hooksIndex.useDeleteResourceDocument).toBe("function");
    expect(typeof hooksIndex.useDeleteResourceImage).toBe("function");
    expect(typeof hooksIndex.useGetDocumentsByRecResourceId).toBe("function");
    expect(typeof hooksIndex.useGetImagesByRecResourceId).toBe("function");
    expect(typeof hooksIndex.useGetRecreationResourceById).toBe("function");
    expect(typeof hooksIndex.useGetRecreationResourceSuggestions).toBe(
      "function",
    );
    expect(typeof hooksIndex.useRecreationResourceAdminApiClient).toBe(
      "function",
    );
    expect(typeof hooksIndex.useUploadResourceDocument).toBe("function");
    expect(typeof hooksIndex.useUploadResourceImage).toBe("function");
    expect(typeof hooksIndex.createRetryHandler).toBe("function");
  });
});
