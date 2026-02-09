import { useGetImagesByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetImagesByRecResourceId';
import { RecreationResourceImageDto } from '@/services/recreation-resource-admin';
import { useMemo } from 'react';
import { formatGalleryFileDate } from '../helpers';
import { GalleryImage } from '../types';
import { findImageVariant } from './utils/findImageVariant';

export function useImageList(rec_resource_id?: string) {
  const { data: imagesFromServer = [], ...other } =
    useGetImagesByRecResourceId(rec_resource_id);

  const galleryImagesFromServer: GalleryImage[] = useMemo(() => {
    return imagesFromServer.map((img: RecreationResourceImageDto) => {
      const variants = img.recreation_resource_image_variants || [];
      const original = findImageVariant(variants, 'original');
      const preview = findImageVariant(variants, 'pre');

      return <GalleryImage>{
        id: img.image_id,
        name: img.file_name,
        date: formatGalleryFileDate(img.created_at),
        url: original?.url,
        extension: original?.extension,
        previewUrl: preview?.url,
        variants,
        type: 'image',
        file_size: img.file_size,
        date_taken: img.date_taken,
        photographer_type: img.photographer_type,
        photographer_type_description: img.photographer_type_description,
        photographer_name: img.photographer_name,
        photographer_display_name: img.photographer_display_name,
        contains_pii: img.contains_pii,
      };
    });
  }, [imagesFromServer]);

  return {
    galleryImagesFromServer,
    ...other,
  };
}
