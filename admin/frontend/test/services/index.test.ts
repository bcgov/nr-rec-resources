import * as servicesIndex from "@/services/index";
import { describe, expect, it } from "vitest";

describe("services/index", () => {
  it("exports auth modules", () => {
    expect(servicesIndex).toHaveProperty("AuthService");
    // UserInfo is a TypeScript interface, not exportable at runtime
  });

  it("exports hooks modules", () => {
    expect(servicesIndex).toHaveProperty("useGlobalQueryErrorHandler");
  });

  it("exports recreation-resource-admin modules", () => {
    expect(servicesIndex).toHaveProperty("useDeleteResourceDocument");
    expect(servicesIndex).toHaveProperty("useDeleteResourceImage");
    expect(servicesIndex).toHaveProperty("useGetDocumentsByRecResourceId");
    expect(servicesIndex).toHaveProperty("useGetImagesByRecResourceId");
    expect(servicesIndex).toHaveProperty("useGetRecreationResourceById");
    expect(servicesIndex).toHaveProperty("useGetRecreationResourceSuggestions");
    expect(servicesIndex).toHaveProperty("useRecreationResourceAdminApiClient");
    expect(servicesIndex).toHaveProperty("useUploadResourceDocument");
    expect(servicesIndex).toHaveProperty("useUploadResourceImage");
  });

  it("exports recreation-resource-admin types", () => {
    // Type exports are available for TypeScript but not testable at runtime
    // This test ensures the module can be imported without errors
    expect(typeof servicesIndex).toBe("object");
  });
});
