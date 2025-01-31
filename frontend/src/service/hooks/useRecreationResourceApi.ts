import {
  Configuration,
  RecreationResourceApi,
} from '@/service/recreation-resource';
import { getBasePath } from '@/service/hooks/helpers';

export const useRecreationResourceApi = () => {
  const configuration = new Configuration({
    basePath: getBasePath(),
  });

  return new RecreationResourceApi(configuration);
};
