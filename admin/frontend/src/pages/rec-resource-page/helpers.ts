import {
  setSelectedFile,
  setShowUploadOverlay,
} from "./store/recResourceFileTransferStore";

/**
 * Formats the date string for display.
 */
export function formatDocumentDate(date: string): string {
  return new Date(date).toLocaleString("en-CA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export const handleAddFileClick = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/pdf";
  input.onchange = (e: any) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadOverlay(true);
    }
  };
  input.click();
};
