import { recResourceLoader } from './recResourceLoader';

export async function recResourceAssetsLoader(args: any) {
  const parentData = await recResourceLoader(args);

  return {
    ...parentData,
  };
}
