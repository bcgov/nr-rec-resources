import { useGetImagesByRecResourceId } from "@/services/hooks/recreation-resource-admin/useGetImagesByRecResourceId";
import { RecreationResourceImageDto } from "@/services/recreation-resource-admin";
import { useMemo } from "react";
import { formatGalleryFileDate } from "../helpers";
import { GalleryImage } from "../types";

/**
 * Hook to manage image list state and syncing.
 * Handles fetching images from server and syncing with pending images.
 */
export function useImageList(rec_resource_id?: string) {
  // fetch images from server
  const { data: imagesFromServer = [], ...other } =
    useGetImagesByRecResourceId(rec_resource_id);

  // Map DTO to GalleryImage
  const galleryImagesFromServer: GalleryImage[] = useMemo(() => {
    return imagesFromServer.map((img: RecreationResourceImageDto) => {
      // original required for image download option
      const original = img.recreation_resource_image_variants?.find(
        (v) => v.size_code === "original",
      );
      const preview = img.recreation_resource_image_variants?.find(
        (v) => v.size_code === "pre",
      );
      return <GalleryImage>{
        id: img.ref_id,
        name: img.caption,
        date: formatGalleryFileDate(img.created_at),
        url: original?.url,
        extension: original?.extension,
        previewUrl: preview?.url,
        variants: img.recreation_resource_image_variants || [],
        type: "image",
      };
    });
  }, [imagesFromServer]);

  return {
    galleryImagesFromServer,
    ...other,
  };
}
