import { customLogger } from "../../src/common/logger.config";

vi.mock("../../src/common/logger.config", () => {
  return {
    customLogger: {
      verbose: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe("CustomLogger", () => {
  it("should be defined", () => {
    expect(customLogger).toBeDefined();
  });

  it("should log a message", () => {
    customLogger.verbose("Test message");
    expect(customLogger.verbose).toHaveBeenCalledWith("Test message");
  });
});
