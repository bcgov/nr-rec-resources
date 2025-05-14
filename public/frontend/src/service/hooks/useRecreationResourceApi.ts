import {
  Configuration,
  RecreationResourceApi,
} from '@/service/recreation-resource';
import { getBasePath } from '@/service/hooks/helpers';

export const useRecreationResourceApi = () =>
  new RecreationResourceApi(
    new Configuration({
      basePath: getBasePath(),
    }),
  );
