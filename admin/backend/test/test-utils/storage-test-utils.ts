import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { PrismaService } from '@/prisma.service';
import { S3Service } from '@/s3/s3.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Mocked, Type, expect, vi } from 'vitest';

export interface StorageTestConfig {
  bucketName: string;
  cloudfrontUrl?: string;
  endpointUrl?: string;
}

export interface StorageTestModuleOptions {
  serviceClass: Type<any>;
  prismaOverrides?: Record<string, any>;
  s3ServiceOverrides?: Record<string, any>;
  appConfigService?: AppConfigService;
  additionalProviders?: Array<{ provide: any; useValue: any }>;
  customS3ServiceProvider?: { provide: any; useValue: any };
}

export interface StorageTestModuleResult<T> {
  module: TestingModule;
  service: T;
  prismaService: Mocked<PrismaService>;
  s3Service?: Mocked<S3Service>;
  appConfigService?: AppConfigService;
}

function defineMockProperty<T>(obj: T, key: keyof T, getter: () => any): void {
  Object.defineProperty(obj, key, {
    get: vi.fn(getter),
    configurable: true,
  });
}

export function createMockAppConfigForStorage(
  config: StorageTestConfig,
): Mocked<AppConfigService> {
  const mockConfig = {
    awsRegion: 'us-east-1',
    ...config,
  } as any;

  const appConfig = {} as Mocked<AppConfigService>;

  defineMockProperty(
    appConfig,
    'recResourcePublicDocsBucket',
    () => config.bucketName,
  );
  defineMockProperty(
    appConfig,
    'recResourceImagesBucket',
    () => config.bucketName,
  );
  defineMockProperty(
    appConfig,
    'establishmentOrderDocsBucket',
    () => config.bucketName,
  );
  defineMockProperty(
    appConfig,
    'recResourceStorageCloudfrontUrl',
    () => config.cloudfrontUrl,
  );
  defineMockProperty(appConfig, 'awsEndpointUrl', () => config.endpointUrl);
  defineMockProperty(appConfig, 'awsRegion', () => mockConfig.awsRegion);

  return appConfig;
}

export function createMockPrismaForStorage(
  overrides: Record<string, any> = {},
): Mocked<PrismaService> {
  return {
    $transaction: vi.fn(),
    recreation_resource: {
      findUnique: vi.fn(),
    },
    recreation_resource_document: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    recreation_resource_image: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
    recreation_resource_image_variants: {
      deleteMany: vi.fn(),
    },
    recreation_establishment_order_docs: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    ...overrides,
  } as any;
}

export function createMockS3Service(): Mocked<S3Service> {
  return {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    getSignedUrl: vi.fn(),
    getSignedUploadUrl: vi.fn(),
    listObjectsByPrefix: vi.fn(),
    getBucketName: vi.fn(),
    getS3Client: vi.fn(),
  } as any;
}

export async function createStorageTestModule<T>(
  options: StorageTestModuleOptions,
): Promise<StorageTestModuleResult<T>> {
  const {
    serviceClass,
    prismaOverrides = {},
    s3ServiceOverrides = {},
    appConfigService,
    additionalProviders = [],
  } = options;

  let mockS3Service: Mocked<S3Service> | undefined;
  if (!options.customS3ServiceProvider) {
    mockS3Service = createMockS3Service();
    Object.assign(mockS3Service, s3ServiceOverrides);
  }

  const providers: any[] = [
    serviceClass,
    {
      provide: PrismaService,
      useValue: createMockPrismaForStorage(prismaOverrides),
    },
    ...additionalProviders,
  ];

  if (options.customS3ServiceProvider) {
    providers.push(options.customS3ServiceProvider);
  } else if (mockS3Service) {
    providers.push({
      provide: S3Service,
      useValue: mockS3Service,
    });
  }

  const moduleConfig: any = { providers };

  if (appConfigService) {
    providers.push({
      provide: AppConfigService,
      useValue: appConfigService,
    });
  } else {
    moduleConfig.imports = [AppConfigModule];
  }

  const module: TestingModule =
    await Test.createTestingModule(moduleConfig).compile();

  const result: StorageTestModuleResult<T> = {
    module,
    service: module.get<T>(serviceClass),
    prismaService: module.get(PrismaService) as Mocked<PrismaService>,
    appConfigService: appConfigService || module.get(AppConfigService),
  };

  if (mockS3Service) {
    result.s3Service = mockS3Service;
  }

  return result;
}

export async function setupAppConfigForStorage(
  config: Partial<StorageTestConfig> = {},
): Promise<AppConfigService> {
  const appConfigModule = await Test.createTestingModule({
    imports: [AppConfigModule],
  }).compile();

  const appConfig = appConfigModule.get<AppConfigService>(AppConfigService);

  const defaultConfig: StorageTestConfig = {
    bucketName: 'test-bucket',
    cloudfrontUrl: 'https://test-cdn.example.com',
    endpointUrl: undefined,
    ...config,
  };

  if (defaultConfig.bucketName) {
    vi.spyOn(appConfig, 'recResourcePublicDocsBucket', 'get').mockReturnValue(
      defaultConfig.bucketName,
    );
    vi.spyOn(appConfig, 'recResourceImagesBucket', 'get').mockReturnValue(
      defaultConfig.bucketName,
    );
    vi.spyOn(appConfig, 'establishmentOrderDocsBucket', 'get').mockReturnValue(
      defaultConfig.bucketName,
    );
  }

  if (defaultConfig.cloudfrontUrl !== undefined) {
    vi.spyOn(
      appConfig,
      'recResourceStorageCloudfrontUrl',
      'get',
    ).mockReturnValue(defaultConfig.cloudfrontUrl || '');
  }

  if (defaultConfig.endpointUrl !== undefined) {
    vi.spyOn(appConfig, 'awsEndpointUrl', 'get').mockReturnValue(
      defaultConfig.endpointUrl,
    );
  }

  return appConfig;
}

export interface ControllerTestModuleOptions {
  controllerClass: Type<any>;
  serviceClass: Type<any>;
  serviceMock?: Record<string, any>;
  additionalProviders?: Array<{ provide: any; useValue: any }>;
  imports?: any[];
}

export interface ControllerTestModuleResult {
  module: TestingModule;
  controller: any;
  service: any;
  app: INestApplication;
}

export async function createControllerTestModule(
  options: ControllerTestModuleOptions,
): Promise<ControllerTestModuleResult> {
  const {
    controllerClass,
    serviceClass,
    serviceMock = {},
    additionalProviders = [],
    imports = [],
  } = options;

  const providers: any[] = [
    controllerClass,
    {
      provide: serviceClass,
      useValue: {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        update: vi.fn(),
        ...serviceMock,
      },
    },
    ...additionalProviders,
  ];

  const module: TestingModule = await Test.createTestingModule({
    imports,
    controllers: [controllerClass],
    providers,
  }).compile();

  const controller = module.get(controllerClass);
  const service = module.get(serviceClass);
  const app = module.createNestApplication();
  await app.init();

  return {
    module,
    controller,
    service,
    app,
  };
}

export async function createNotFoundTest(
  testFn: () => void | Promise<void>,
  serviceMethod: (...args: any[]) => Promise<any>,
  params: any[],
  expectedError?: string | HttpException,
): Promise<void> {
  await testFn();
  const promise = serviceMethod(...params);

  if (expectedError) {
    await expect(promise).rejects.toThrow(expectedError);
  } else {
    await expect(promise).rejects.toThrow();
  }
}

const DEFAULT_REC_RESOURCE_ID = 'REC0001';

export function createMockDocument(
  docId: string,
  caption: string,
  recResourceId: string = DEFAULT_REC_RESOURCE_ID,
  overrides: Record<string, any> = {},
) {
  return {
    doc_id: docId,
    rec_resource_id: recResourceId,
    doc_code: 'RM',
    file_name: 'sample',
    extension: 'pdf',
    created_at: new Date(),
    recreation_resource_doc_code: { description: caption },
    ...overrides,
  };
}

export function createMockImage(
  imageId: string,
  recResourceId: string = DEFAULT_REC_RESOURCE_ID,
  overrides: Record<string, any> = {},
) {
  return {
    rec_resource_id: recResourceId,
    image_id: imageId,
    file_name: `image-${imageId}.webp`,
    extension: 'webp',
    file_size: BigInt(1024),
    created_at: new Date(),
    ...overrides,
  };
}

export function createMockEstablishmentOrderDoc(
  s3Key: string,
  recResourceId: string = DEFAULT_REC_RESOURCE_ID,
  overrides: Record<string, any> = {},
) {
  return {
    s3_key: s3Key,
    rec_resource_id: recResourceId,
    title: 'Test Order',
    file_size: BigInt(1024000),
    extension: 'pdf',
    created_at: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}
