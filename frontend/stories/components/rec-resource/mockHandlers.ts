import { http, HttpResponse } from 'msw';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { MOCK_RECREATION_SITE } from './mockData';

export const mockHandlers = {
  getDefaultResource: http.get('/api/v1/recreation-resource/:id', () => {
    return HttpResponse.json(MOCK_RECREATION_SITE);
  }),

  createResourceHandler: (response: RecreationResourceDetailModel) =>
    http.get('/api/v1/recreation-resource/:id', () => {
      return HttpResponse.json(response);
    }),
};
