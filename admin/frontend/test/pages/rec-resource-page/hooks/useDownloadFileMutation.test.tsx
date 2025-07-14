import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

vi.mock("@/utils/fileUtils", () => ({ downloadUrlAsFile: vi.fn() }));
vi.mock("@/store/notificationStore", () => ({
  addSuccessNotification: vi.fn(),
  addErrorNotification: vi.fn(),
}));

import * as fileUtils from "@/utils/fileUtils";
import * as notificationStore from "@/store/notificationStore";
import { useDownloadFileMutation } from "@/pages/rec-resource-page/hooks/useDownloadFileMutation";

const createWrapper = () => {
  const queryClient = new QueryClient();
  return function Wrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    );
  };
};

const getMutation = () => {
  const { result } = renderHook(() => useDownloadFileMutation(), {
    wrapper: createWrapper(),
  });
  return result.current;
};

describe("useDownloadFileMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls downloadUrlAsFile and shows success notification on success", async () => {
    (fileUtils.downloadUrlAsFile as any).mockResolvedValueOnce(undefined);
    const mutation = getMutation();
    await act(async () => {
      await mutation.mutateAsync({ url: "test-url", fileName: "file.pdf" });
    });
    expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
      "test-url",
      "file.pdf",
    );
    expect(notificationStore.addSuccessNotification).toHaveBeenCalledWith(
      'File "file.pdf" downloaded successfully.',
    );
    expect(notificationStore.addErrorNotification).not.toHaveBeenCalled();
  });

  it("shows error notification on failure", async () => {
    (fileUtils.downloadUrlAsFile as any).mockRejectedValueOnce(
      new Error("fail"),
    );
    const mutation = getMutation();
    await act(async () => {
      await expect(
        mutation.mutateAsync({ url: "bad-url", fileName: "bad.pdf" }),
      ).rejects.toThrow();
    });
    expect(fileUtils.downloadUrlAsFile).toHaveBeenCalledWith(
      "bad-url",
      "bad.pdf",
    );
    expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
      'Failed to download file "bad.pdf".',
    );
    expect(notificationStore.addSuccessNotification).not.toHaveBeenCalled();
  });
});
