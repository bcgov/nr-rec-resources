import { SearchRecreationResourcesRequest } from '@/service/recreation-resource';

export type URLSearchFilterParams = Omit<
  SearchRecreationResourcesRequest,
  'page' | 'imageSizeCodes' | 'limit'
>;
