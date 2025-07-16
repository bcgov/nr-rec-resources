import {
  faCloudDownload,
  faEye,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { GalleryAction } from "../../../types";

/**
 * Available file actions configuration
 */
export const CARD_ACTIONS: ReadonlyArray<{
  key: Extract<GalleryAction, "view" | "download" | "delete">;
  icon: IconDefinition;
  label: string;
}> = [
  { key: "view", icon: faEye, label: "View" },
  { key: "download", icon: faCloudDownload, label: "Download" },
  { key: "delete", icon: faTrash, label: "Delete" },
] as const;
