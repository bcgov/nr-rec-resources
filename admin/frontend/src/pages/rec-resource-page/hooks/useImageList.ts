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
      };
    });
  }, [imagesFromServer]);

  return {
    galleryImagesFromServer,
    ...other,
  };
}
