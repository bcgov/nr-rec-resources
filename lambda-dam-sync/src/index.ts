import { APIGatewayProxyHandler } from 'aws-lambda';
import { ResourceDocsService } from './service/resource-docs.service';
import { ResourceImagesService } from './service/resource-images.service';

export const handler: APIGatewayProxyHandler = async (_event) => {
  const imagesService = new ResourceImagesService();
  const docsService = new ResourceDocsService();
  await imagesService.syncImagesCollection();
  const data = await docsService.syncDocsCollection();
  return data;
};
