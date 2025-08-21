import * as helpersModule from "@/services/recreation-resource-admin/hooks/helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("transformRecreationResourceDocs", () => {
  it("should prepend base path to each doc url", () => {
    vi.stubEnv("VITE_RECREATION_RESOURCE_ASSETS_BASE_URL", undefined);
    const docs = [
      { id: 1, url: "file1.pdf" },
      { id: 2, url: "file2.pdf" },
    ];

    const result = helpersModule.transformRecreationResourceDocs(docs as any);
    expect(result).toEqual([
      {
        id: 1,
        url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/file1.pdf",
      },
      {
        id: 2,
        url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/file2.pdf",
      },
    ]);
  });

  it("should return empty array if input is empty", () => {
    expect(helpersModule.transformRecreationResourceDocs([])).toEqual([]);
  });
});

describe("transformRecreationResourceImages", () => {
  it("should prepend base path to each image variant url", () => {
    vi.stubEnv("VITE_RECREATION_RESOURCE_ASSETS_BASE_URL", undefined);
    const images = [
      {
        id: 1,
        recreation_resource_image_variants: [
          { id: 1, url: "image1-small.jpg" },
          { id: 2, url: "image1-large.jpg" },
        ],
      },
      {
        id: 2,
        recreation_resource_image_variants: [
          { id: 3, url: "image2-small.jpg" },
        ],
      },
    ];

    const result = helpersModule.transformRecreationResourceImages(
      images as any,
    );
    expect(result).toEqual([
      {
        id: 1,
        recreation_resource_image_variants: [
          {
            id: 1,
            url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/image1-small.jpg",
          },
          {
            id: 2,
            url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/image1-large.jpg",
          },
        ],
      },
      {
        id: 2,
        recreation_resource_image_variants: [
          {
            id: 3,
            url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/image2-small.jpg",
          },
        ],
      },
    ]);
  });

  it("should handle images without variants", () => {
    const images = [
      { id: 1, recreation_resource_image_variants: undefined },
      { id: 2, recreation_resource_image_variants: null },
    ];

    const result = helpersModule.transformRecreationResourceImages(
      images as any,
    );
    expect(result).toEqual([
      { id: 1, recreation_resource_image_variants: undefined },
      { id: 2, recreation_resource_image_variants: undefined }, // null becomes undefined due to optional chaining
    ]);
  });

  it("should return empty array if input is empty", () => {
    expect(helpersModule.transformRecreationResourceImages([])).toEqual([]);
  });
});

describe("getBasePathForAssets", () => {
  it("should return the env var if set", () => {
    vi.stubEnv("VITE_RECREATION_RESOURCE_ASSETS_BASE_URL", "https://env-url");
    expect(helpersModule.getBasePathForAssets()).toBe("https://env-url");
  });

  it("should return the default if env var is not set", () => {
    vi.stubEnv("VITE_RECREATION_RESOURCE_ASSETS_BASE_URL", undefined);
    expect(helpersModule.getBasePathForAssets()).toBe(
      "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca",
    );
  });
});

describe("createRetryHandler", () => {
  // Manual mock for onFail callback
  const onFailMock = () => {
    (onFailMock as any).called = true;
  };
  onFailMock.called = false;

  it("retries for 5xx errors up to maxRetries", () => {
    const handler = helpersModule.createRetryHandler({ maxRetries: 2 });
    const error = { response: { status: 502 } };
    expect(handler(0, error)).toBe(true);
    expect(handler(1, error)).toBe(true);
    expect(handler(2, error)).toBe(false);
  });

  it("does not retry for 4xx errors", () => {
    const handler = helpersModule.createRetryHandler();
    const error = { response: { status: 404 } };
    expect(handler(0, error)).toBe(false);
  });

  it("does not retry if error has no response", () => {
    const handler = helpersModule.createRetryHandler();
    const error = new Error("Network error");
    expect(handler(0, error)).toBe(false);
  });

  it("calls onFail when retries are exhausted", () => {
    onFailMock.called = false;
    const handler = helpersModule.createRetryHandler({
      maxRetries: 1,
      onFail: onFailMock,
    });
    const error = { response: { status: 502 } };
    expect(handler(1, error)).toBe(false);
    expect(onFailMock.called).toBe(true);
  });

  it("returns false for non-object errors", () => {
    const handler = helpersModule.createRetryHandler();
    expect(handler(0, null)).toBe(false);
    expect(handler(0, undefined)).toBe(false);
    expect(handler(0, 123)).toBe(false);
  });
});
