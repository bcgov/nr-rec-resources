import { useMutation } from "@tanstack/react-query";
import {
  addSuccessNotification,
  addErrorNotification,
} from "@/store/notificationStore";
import { downloadUrlAsFile } from "@/utils/fileUtils";

/**
 * React hook for downloading a file and showing notifications for success or error.
 *
 * This hook provides a mutation that downloads a file from a given URL and filename,
 * and displays a success or error notification based on the result.
 */
export function useDownloadFileMutation() {
  return useMutation<void, unknown, { url: string; fileName: string }>({
    mutationFn: async ({ url, fileName }) => {
      await downloadUrlAsFile(url, fileName);
    },
    onSuccess: (_data, variables) => {
      addSuccessNotification(
        `File "${variables.fileName}" downloaded successfully.`,
      );
    },
    onError: (_error, variables) => {
      addErrorNotification(`Failed to download file "${variables.fileName}".`);
    },
  });
}
