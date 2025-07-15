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

/**
 * Handles the click event for adding a file.
 *
 * Creates a hidden file input element restricted to the specified file types,
 * triggers the file picker dialog, and upon file selection,
 * updates the selected file state and displays the upload overlay.
 *
 * @param accept - A string specifying the accepted file types (e.g., "application/pdf").
 *
 * @remarks
 * This function is intended to be used as an event handler for file upload actions.
 */
export function handleAddFileClick(accept: string): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.style.display = "none";

  input.onchange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      setSelectedFile(target.files[0]);
      setShowUploadOverlay(true);
    }
    document.body.removeChild(input);
  };

  document.body.appendChild(input);
  input.click();
}

/**
 * Handles the click event for adding a PDF file.
 *
 * Restricts the file picker to accept only PDF files.
 */
export function handleAddPdfFileClick(): void {
  handleAddFileClick("application/pdf");
}
