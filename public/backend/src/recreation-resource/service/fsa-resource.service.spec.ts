import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiModule, ClientAPIService } from 'src/service/fsa-resources';
import { FsaResourceService } from './fsa-resource.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';

describe('FsaResourceService', () => {
  let service: FsaResourceService;
  let httpClient: HttpService;

  const data = {
    clientNumber: '0001',
    clientName: 'CLIENT NAME',
    clientStatusCode: 'DAC',
    clientTypeCode: 'G',
  };

  const response: AxiosResponse<any> = {
    data,
    headers: {},
    config: {
      url: 'http://localhost:3000/mockUrl',
      headers: undefined,
    },
    status: 200,
    statusText: 'OK',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ApiModule, HttpModule],
      providers: [FsaResourceService, ClientAPIService],
    }).compile();

    service = module.get<FsaResourceService>(FsaResourceService);
    httpClient = module.get<HttpService>(HttpService);
  });

  describe('findByClientNumber', () => {
    it('should return site operator object', async () => {
      vi.spyOn(httpClient, 'get').mockImplementationOnce(() => of(response));
      const result = await service.findByClientNumber('0001');
      expect(result).toMatchObject(data);
    });

    it('should return an error when access the api', async () => {
      vi.spyOn(httpClient, 'get').mockRejectedValueOnce({ error: 'error' });
      try {
        await service.findByClientNumber('0001');
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });
});
