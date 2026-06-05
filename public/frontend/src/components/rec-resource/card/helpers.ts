import {
  RecreationActivityDto,
  RecreationResourceImageDto,
} from '@/service/recreation-resource';

export interface RecResourceCardResource {
  rec_resource_id: string;
  name: string;
  recreation_activity: Array<RecreationActivityDto>;
  closest_community: string;
  recreation_status: { status_code: number; description: string };
  rec_resource_type: string;
  recreation_resource_images?: Array<RecreationResourceImageDto>;
  advisory_count: number;
}

export const getImageList = (
  recreationResource: RecResourceCardResource,
): Array<{ imageUrl: string }> => {
  return (
    recreationResource.recreation_resource_images
      ?.map((img: RecreationResourceImageDto) => ({
        imageUrl: img.url?.thm ?? img.url?.pre ?? img.url?.original ?? '',
      }))
      .filter((img) => img.imageUrl !== '') ?? []
  );
};
