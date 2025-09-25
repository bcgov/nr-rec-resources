import { AppConfigService } from '@/app-config/app-config.service';
import {
  DamApiCoreService,
  DamApiHttpService,
  DamApiModule,
  DamApiService,
  DamApiUtilsService,
} from '@/dam-api';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

describe('DamApiModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    const mockAppConfigService = {
      damUrl: 'https://test-dam.example.com',
      damPrivateKey: 'test-private-key',
      damUser: 'test-user',
      damRstPdfCollectionId: 'pdf-collection-123',
      damRstImageCollectionId: 'image-collection-123',
      damResourceTypePdf: 1,
      damResourceTypeImage: 2,
    };

    module = await Test.createTestingModule({
      imports: [DamApiModule],
    })
      .overrideProvider(AppConfigService)
      .useValue(mockAppConfigService)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide DamApiService', () => {
    const service = module.get<DamApiService>(DamApiService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DamApiService);
  });

  it('should provide DamApiCoreService', () => {
    const service = module.get<DamApiCoreService>(DamApiCoreService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DamApiCoreService);
  });

  it('should provide DamApiHttpService', () => {
    const service = module.get<DamApiHttpService>(DamApiHttpService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DamApiHttpService);
  });

  it('should provide DamApiUtilsService', () => {
    const service = module.get<DamApiUtilsService>(DamApiUtilsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DamApiUtilsService);
  });

  it('should export DamApiService', () => {
    const exportedService = module.get<DamApiService>(DamApiService);
    expect(exportedService).toBeDefined();
  });

  it('should have all required dependencies injected', () => {
    const damApiService = module.get<DamApiService>(DamApiService);
    const coreService = module.get<DamApiCoreService>(DamApiCoreService);
    const httpService = module.get<DamApiHttpService>(DamApiHttpService);
    const utilsService = module.get<DamApiUtilsService>(DamApiUtilsService);

    expect(damApiService).toBeDefined();
    expect(coreService).toBeDefined();
    expect(httpService).toBeDefined();
    expect(utilsService).toBeDefined();
  });
});
