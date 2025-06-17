import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  addResourceToCollection,
  createResource,
  deleteResource,
  getResourcePath,
  uploadFile,
} from "../../../../src/resource-docs/service/dam-api/dam-api";

vi.mock("axios");

const mockFiles = [
  {
    size_code: "original",
    extension: "pdf",
    url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/5/2/7/1/1_d013539987403c7/11725_e98a7f0c65e33e2.pdf?v=1750108676",
    width: "?",
    height: "?",
    filesize: "36&nbsp;KB",
  },
  {
    size_code: "pre",
    extension: "jpg",
    url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/5/2/7/1/1_d013539987403c7/11725pre_dac9fb32bc18262.jpg?v=1750108678",
    width: 371,
    height: 480,
    filesize: "2&nbsp;KB",
  },
  {
    size_code: "thm",
    extension: "jpg",
    url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/5/2/7/1/1_d013539987403c7/11725thm_e7af02088bfa851.jpg?v=1750108678",
    width: 135,
    height: 175,
    filesize: "311&nbsp;B",
  },
  {
    size_code: "col",
    extension: "jpg",
    url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/5/2/7/1/1_d013539987403c7/11725col_f54a5709afce671.jpg?v=1750108678",
    width: 58,
    height: 75,
    filesize: "209&nbsp;B",
  },
  {
    size_code: "original",
    extension: "jpg",
    url: "https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/5/2/7/1/1_d013539987403c7/11725_e98a7f0c65e33e2.jpg?v=1750108677",
    width: "?",
    height: "?",
    filesize: "36&nbsp;KB",
  },
];

describe("getResourcePath", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return data on success", async () => {
    (axios.post as any).mockResolvedValue({ data: mockFiles });
    const result = await getResourcePath("resource-id");
    expect(result.length).toEqual(5);
  });

  it("should throw error on failure", async () => {
    const error = new Error("API Error");
    (axios.post as any).mockRejectedValue(error);

    await expect(getResourcePath("bad-resource")).rejects.toThrow("API Error");
  });
});

describe("createResource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return new resource id", async () => {
    (axios.post as any).mockResolvedValue({ data: 123 });
    const result = await createResource();
    expect(result).toEqual(123);
  });

  it("should throw error on failure", async () => {
    const error = new Error("API Error");
    (axios.post as any).mockRejectedValue(error);

    await expect(createResource()).rejects.toThrow("API Error");
  });
});

describe("addResourceToCollection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true on success", async () => {
    (axios.post as any).mockResolvedValue({ data: true });
    const result = await addResourceToCollection("resource-id");
    expect(result).toEqual(true);
  });

  it("should throw error on failure", async () => {
    const error = new Error("API Error");
    (axios.post as any).mockRejectedValue(error);

    await expect(addResourceToCollection("resource-id")).rejects.toThrow(
      "API Error",
    );
  });
});

describe("deleteResource", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true on success", async () => {
    (axios.post as any).mockResolvedValue({ data: true });
    const result = await deleteResource("resource-id");
    expect(result).toEqual(true);
  });

  it("should throw error on failure", async () => {
    const error = new Error("API Error");
    (axios.post as any).mockRejectedValue(error);

    await expect(deleteResource("resource-id")).rejects.toThrow("API Error");
  });
});

describe("uploadFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return true on success", async () => {
    (axios.post as any).mockResolvedValue({ data: true });
    const result = await uploadFile("resource-id", "filepath");
    expect(result).toEqual(true);
  });

  it("should throw error on failure", async () => {
    const error = new Error("API Error");
    (axios.post as any).mockRejectedValue(error);

    await expect(uploadFile("resource-id", "filepath")).rejects.toThrow(
      "API Error",
    );
  });
});
