import {
  Configuration,
  RecreationResourceApi,
} from '@/service/recreation-resource';

export const useRecreationResourceApi = () => {
  const configuration = new Configuration({
    basePath: '',
  });

  return new RecreationResourceApi(configuration);
};
