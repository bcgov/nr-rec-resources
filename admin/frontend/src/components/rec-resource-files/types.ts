import { RecreationResourceDocDto } from "@/services/recreation-resource-admin";

export interface PendingRecreationResourceDocDto
  extends RecreationResourceDocDto {
  isDownlading?: boolean;
  isDownloadError?: boolean;
}
