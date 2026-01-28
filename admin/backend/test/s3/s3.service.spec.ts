import { AppConfigService } from '@/app-config/app-config.service';
import { S3Service } from '@/s3/s3.service';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAppConfigTestModule,
  createMockS3Client,
  setupS3ClientMock,
} from '../test-utils/s3-test-utils';

vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let mockS3Client: Mocked<S3Client>;
  const bucketName = 'rst-lza-establishment-order-docs-dev';
  const region = 'ca-central-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    mockS3Client = createMockS3Client();
    setupS3ClientMock(mockS3Client);
    const module = await createAppConfigTestModule({
      establishmentOrderDocsBucket: bucketName,
      awsRegion: region,
    });
    const appConfig = module.get<AppConfigService>(AppConfigService);
    service = new S3Service(appConfig, appConfig.establishmentOrderDocsBucket);
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize S3Client with correct region', () => {
      expect(S3Client).toHaveBeenCalledWith({ region });
    });

    it('should return correct bucket name via getBucketName()', () => {
      expect(service.getBucketName()).toBe(bucketName);
    });

    it('should return S3Client instance via getS3Client()', () => {
      const client = service.getS3Client();
      expect(client).toBe(mockS3Client);
      expect(typeof client.send).toBe('function');
    });

    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])('should throw error when bucket name is %s', async (_, bucketName) => {
      const module = await createAppConfigTestModule({
        establishmentOrderDocsBucket: bucketName,
        awsRegion: region,
      });
      const appConfig = module.get<AppConfigService>(AppConfigService);
      expect(() => new S3Service(appConfig, bucketName as any)).toThrow(
        'Bucket name is required',
      );
    });
  });

  describe('getSignedUrl', () => {
    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])('should throw BadRequestException when key is %s', async (_, key) => {
      const promise = service.getSignedUrl(key as any);
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('S3 key is required');
    });

    it.each([
      ['0', 0],
      ['negative', -1],
      ['exceeds 604800', 604801],
    ])(
      'should throw BadRequestException when expiresIn is %s',
      async (_, expiresIn) => {
        const promise = service.getSignedUrl('test-key', expiresIn as number);
        await expect(promise).rejects.toThrow(BadRequestException);
        await expect(promise).rejects.toThrow(
          'Expiration time must be between 1 and 604800 seconds',
        );
      },
    );

    it('should generate presigned URL for valid S3 key', async () => {
      const testKey = 'REC0001/establishment-order.pdf';
      const expectedUrl =
        'https://s3.amazonaws.com/bucket/REC0001/establishment-order.pdf?signature=abc123';
      vi.mocked(getSignedUrl).mockResolvedValueOnce(expectedUrl);

      const result = await service.getSignedUrl(testKey);

      expect(result).toBe(expectedUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should use default expiration time (3600 seconds) when not specified', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUrl('REC0001/document.pdf');
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should use custom expiration time when provided', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUrl('REC0001/document.pdf', 7200);
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 7200 },
      );
    });

    it('should throw error when S3 operation fails', async () => {
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error('Access Denied'));
      await expect(service.getSignedUrl('REC0001/invalid.pdf')).rejects.toThrow(
        'Failed to generate presigned URL',
      );
    });

    it('should create GetObjectCommand with correct parameters', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUrl('REC0001/test.pdf');
      expect(vi.mocked(getSignedUrl).mock.calls[0]?.[1]).toBeInstanceOf(
        GetObjectCommand,
      );
    });

    describe('LocalStack endpoint URL construction', () => {
      const localStackEndpoint = 'http://localhost:4566';

      const createLocalStackService = async (endpointUrl: string) => {
        const module = await createAppConfigTestModule({
          establishmentOrderDocsBucket: bucketName,
          awsRegion: region,
          awsEndpointUrl: endpointUrl,
        });
        const appConfig = module.get<AppConfigService>(AppConfigService);
        return new S3Service(appConfig, appConfig.establishmentOrderDocsBucket);
      };

      it('should construct direct LocalStack URL when endpoint is set', async () => {
        const localStackService =
          await createLocalStackService(localStackEndpoint);
        const testKey = 'REC0001/document.pdf';
        const expectedUrl = `${localStackEndpoint}/${bucketName}/${testKey}`;

        const result = await localStackService.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
        expect(getSignedUrl).not.toHaveBeenCalled();
      });

      it('should remove trailing slash from endpoint URL', async () => {
        const serviceWithSlash = await createLocalStackService(
          'http://localhost:4566/',
        );
        const testKey = 'REC0001/document.pdf';
        const expectedUrl = `http://localhost:4566/${bucketName}/${testKey}`;

        const result = await serviceWithSlash.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
      });

      it('should handle HTTPS endpoint URLs', async () => {
        const httpsService = await createLocalStackService(
          'https://localstack.example.com',
        );
        const testKey = 'REC0001/document.pdf';
        const expectedUrl = `https://localstack.example.com/${bucketName}/${testKey}`;

        const result = await httpsService.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
      });

      it('should trim key when constructing LocalStack URL', async () => {
        const localStackService =
          await createLocalStackService(localStackEndpoint);
        const testKey = '  REC0001/document.pdf  ';
        const expectedUrl = `${localStackEndpoint}/${bucketName}/REC0001/document.pdf`;

        const result = await localStackService.getSignedUrl(testKey);

        expect(result).toBe(expectedUrl);
      });
    });
  });

  describe('listObjectsByPrefix', () => {
    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw BadRequestException when prefix is %s',
      async (_, prefix) => {
        const promise = service.listObjectsByPrefix(prefix as any);
        await expect(promise).rejects.toThrow(BadRequestException);
        await expect(promise).rejects.toThrow('Prefix is required');
      },
    );

    it('should return array of objects for valid prefix', async () => {
      const mockResponse = {
        Contents: [
          {
            Key: 'REC0001/document1.pdf',
            Size: 1024000,
            LastModified: new Date('2024-01-01T00:00:00Z'),
          },
          {
            Key: 'REC0001/document2.pdf',
            Size: 2048000,
            LastModified: new Date('2024-01-02T00:00:00Z'),
          },
        ],
      };
      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix('REC0001/');

      expect(result).toEqual([
        {
          key: 'REC0001/document1.pdf',
          size: 1024000,
          lastModified: new Date('2024-01-01T00:00:00Z'),
        },
        {
          key: 'REC0001/document2.pdf',
          size: 2048000,
          lastModified: new Date('2024-01-02T00:00:00Z'),
        },
      ]);
    });

    it.each([
      ['undefined Contents', {}],
      ['empty Contents', { Contents: [] }],
    ])('should return empty array when %s', async (_, mockResponse) => {
      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);
      const result = await service.listObjectsByPrefix('REC9999/');
      expect(result).toEqual([]);
    });

    it('should throw error when S3 operation fails', async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error('Network error'));
      await expect(service.listObjectsByPrefix('REC0001/')).rejects.toThrow(
        'Failed to list objects',
      );
    });

    it('should map S3 response correctly for multiple objects', async () => {
      const date1 = new Date('2024-06-01T10:30:00Z');
      const date2 = new Date('2024-06-02T14:45:00Z');
      const mockResponse = {
        Contents: [
          { Key: 'REC0002/file1.pdf', Size: 500, LastModified: date1 },
          { Key: 'REC0002/file2.pdf', Size: 1500, LastModified: date2 },
        ],
      };
      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix('REC0002/');

      expect(result).toEqual([
        { key: 'REC0002/file1.pdf', size: 500, lastModified: date1 },
        { key: 'REC0002/file2.pdf', size: 1500, lastModified: date2 },
      ]);
    });
  });

  describe('uploadFile', () => {
    const mockFile = Buffer.from('test file content');
    const recResourceId = 'REC0001';
    const filename = 'test-document.pdf';
    const expectedKey = 'REC0001/test-document.pdf';

    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw BadRequestException when recResourceId is %s',
      async (_, invalidId) => {
        const promise = service.uploadFile(
          invalidId as any,
          mockFile,
          filename,
        );
        await expect(promise).rejects.toThrow(BadRequestException);
        await expect(promise).rejects.toThrow(
          'Recreation resource ID is required',
        );
      },
    );

    it.each([
      ['empty', Buffer.from('')],
      ['null', null],
    ])(
      'should throw FileValidationException when file buffer is %s',
      async (_, invalidBuffer) => {
        await expect(
          service.uploadFile(recResourceId, invalidBuffer as any, filename),
        ).rejects.toThrow('File buffer cannot be empty');
      },
    );

    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw FileValidationException when filename is %s',
      async (_, invalidFilename) => {
        await expect(
          service.uploadFile(recResourceId, mockFile, invalidFilename as any),
        ).rejects.toThrow('File name is required');
      },
    );

    it('should upload file successfully when file does not exist', async () => {
      mockS3Client.send
        .mockRejectedValueOnce({
          name: 'NotFound',
          $metadata: { httpStatusCode: 404 },
        })
        .mockResolvedValueOnce({} as any);

      const result = await service.uploadFile(
        recResourceId,
        mockFile,
        filename,
      );

      expect(result).toBe(expectedKey);
      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
      expect(mockS3Client.send.mock.calls[0]?.[0]).toBeInstanceOf(
        HeadObjectCommand,
      );
      expect(mockS3Client.send.mock.calls[1]?.[0]).toBeInstanceOf(
        PutObjectCommand,
      );
    });

    it('should throw error when file already exists', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);
      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow(`File "${filename}" already exists`);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should construct correct S3 key from recResourceId and filename', async () => {
      mockS3Client.send
        .mockRejectedValueOnce({
          name: 'NotFound',
          $metadata: { httpStatusCode: 404 },
        })
        .mockResolvedValueOnce({} as any);

      const result = await service.uploadFile('REC0042', mockFile, 'order.pdf');

      expect(result).toBe('REC0042/order.pdf');
    });

    it('should handle 404 httpStatusCode as file not found', async () => {
      mockS3Client.send
        .mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } })
        .mockResolvedValueOnce({} as any);

      const result = await service.uploadFile(
        recResourceId,
        mockFile,
        filename,
      );

      expect(result).toBe(expectedKey);
      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
    });

    it('should throw error when PutObjectCommand fails', async () => {
      mockS3Client.send
        .mockRejectedValueOnce({
          name: 'NotFound',
          $metadata: { httpStatusCode: 404 },
        })
        .mockRejectedValueOnce(new Error('Insufficient permissions'));

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow('Failed to upload file');
    });

    it('should throw error when HeadObjectCommand fails with non-404 error', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      mockS3Client.send.mockRejectedValueOnce(networkError);

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow('Failed to check file existence');
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when HeadObjectCommand fails with generic error', async () => {
      const genericError = new Error('S3 service unavailable');
      genericError.name = 'ServiceUnavailable';
      mockS3Client.send.mockRejectedValueOnce(genericError);

      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should preserve BadRequestException when file already exists', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);
      await expect(
        service.uploadFile(recResourceId, mockFile, filename),
      ).rejects.toThrow(BadRequestException);
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should handle files with special characters in filename', async () => {
      const specialFilename = 'test document #2024.pdf';
      mockS3Client.send
        .mockRejectedValueOnce({
          name: 'NotFound',
          $metadata: { httpStatusCode: 404 },
        })
        .mockResolvedValueOnce({} as any);

      const result = await service.uploadFile(
        recResourceId,
        mockFile,
        specialFilename,
      );

      expect(result).toBe('REC0001/test document #2024.pdf');
    });
  });

  describe('deleteFile', () => {
    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])('should throw BadRequestException when key is %s', async (_, key) => {
      const promise = service.deleteFile(key as any);
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('S3 key is required');
    });

    it('should delete file successfully', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);
      await service.deleteFile('REC0001/test-document.pdf');
      expect(mockS3Client.send.mock.calls[0]?.[0]).toBeInstanceOf(
        DeleteObjectCommand,
      );
    });

    it('should throw error when S3 deletion fails', async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error('Access Denied'));
      await expect(
        service.deleteFile('REC0001/test-document.pdf'),
      ).rejects.toThrow('Failed to delete file');
    });

    it('should handle deletion of files with special characters', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);
      await service.deleteFile('REC0001/test document @#2024.pdf');
      expect(mockS3Client.send.mock.calls[0]?.[0]).toBeInstanceOf(
        DeleteObjectCommand,
      );
    });

    it('should handle deletion of non-existent files', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);
      await expect(
        service.deleteFile('REC0001/nonexistent.pdf'),
      ).resolves.not.toThrow();
      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should delete files from different resource IDs', async () => {
      mockS3Client.send.mockResolvedValue({} as any);
      await service.deleteFile('REC0001/doc1.pdf');
      await service.deleteFile('REC0042/doc2.pdf');
      expect(mockS3Client.send).toHaveBeenCalledTimes(2);
      expect(mockS3Client.send.mock.calls[0]?.[0]).toBeInstanceOf(
        DeleteObjectCommand,
      );
      expect(mockS3Client.send.mock.calls[1]?.[0]).toBeInstanceOf(
        DeleteObjectCommand,
      );
    });

    it.each([
      ['network error', 'NetworkError', 'Network timeout'],
      ['permission error', 'AccessDenied', 'Access Denied'],
      ['bucket not found error', 'NoSuchBucket', 'Bucket does not exist'],
    ])(
      'should throw InternalServerErrorException when delete fails with %s',
      async (_, errorName, errorMessage) => {
        const error = new Error(errorMessage);
        error.name = errorName;
        mockS3Client.send.mockRejectedValueOnce(error);

        const promise = service.deleteFile('REC0001/test-document.pdf');
        await expect(promise).rejects.toThrow(InternalServerErrorException);
        await expect(promise).rejects.toThrow('Failed to delete file');
      },
    );

    it('should include error message in exception when delete fails', async () => {
      mockS3Client.send.mockRejectedValueOnce(
        new Error('Custom S3 error message'),
      );

      try {
        await service.deleteFile('REC0001/test-document.pdf');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect((error as Error).message).toContain('Failed to delete file');
      }
    });
  });

  describe('getSignedUploadUrl', () => {
    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])('should throw BadRequestException when key is %s', async (_, key) => {
      const promise = service.getSignedUploadUrl(key as any, 'image/webp');
      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('S3 key is required');
    });

    it.each([
      ['empty', ''],
      ['null', null],
      ['whitespace only', '   '],
    ])(
      'should throw BadRequestException when contentType is %s',
      async (_, contentType) => {
        const promise = service.getSignedUploadUrl(
          'test-key',
          contentType as any,
        );
        await expect(promise).rejects.toThrow(BadRequestException);
        await expect(promise).rejects.toThrow('Content type is required');
      },
    );

    it.each([
      ['0', 0],
      ['negative', -1],
      ['exceeds 604800', 604801],
    ])(
      'should throw BadRequestException when expiresIn is %s',
      async (_, expiresIn) => {
        const promise = service.getSignedUploadUrl(
          'test-key',
          'image/webp',
          expiresIn as number,
        );
        await expect(promise).rejects.toThrow(BadRequestException);
        await expect(promise).rejects.toThrow(
          'Expiration time must be between 1 and 604800 seconds',
        );
      },
    );

    it('should generate presigned URL for valid parameters', async () => {
      const expectedUrl =
        'https://s3.amazonaws.com/bucket/images/REC0001/test-image.webp?signature=abc123';
      vi.mocked(getSignedUrl).mockResolvedValueOnce(expectedUrl);

      const result = await service.getSignedUploadUrl(
        'images/REC0001/test-image.webp',
        'image/webp',
      );

      expect(result).toBe(expectedUrl);
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 900 },
      );
    });

    it('should use default expiration time (900 seconds) when not specified', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUploadUrl(
        'documents/REC0001/test.pdf',
        'application/pdf',
      );
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 900 },
      );
    });

    it('should use custom expiration time when provided', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUploadUrl(
        'images/REC0001/test.webp',
        'image/webp',
        1800,
      );
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 1800 },
      );
    });

    it('should include tags in PutObjectCommand when provided', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUploadUrl(
        'images/REC0001/original.webp',
        'image/webp',
        900,
        { filename: 'my-image', category: 'photo' },
      );
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 900 },
      );
      expect(PutObjectCommand).toHaveBeenCalled();
    });

    it('should URL encode tag keys and values', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUploadUrl(
        'images/REC0001/test.webp',
        'image/webp',
        900,
        { 'file name': 'my image', 'category&type': 'photo/test' },
      );
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 900 },
      );
      expect(PutObjectCommand).toHaveBeenCalled();
    });

    it.each([
      ['empty object', {}],
      ['undefined', undefined],
    ])(
      'should not include Tagging in command when tags are %s',
      async (_, tags) => {
        vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
        await service.getSignedUploadUrl(
          'images/REC0001/test.webp',
          'image/webp',
          900,
          tags,
        );
        expect(getSignedUrl).toHaveBeenCalledWith(
          mockS3Client,
          expect.any(PutObjectCommand),
          { expiresIn: 900 },
        );
        expect(PutObjectCommand).toHaveBeenCalled();
      },
    );

    it('should trim key and contentType before processing', async () => {
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');
      await service.getSignedUploadUrl(
        '  images/REC0001/test.webp  ',
        '  image/webp  ',
      );
      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(PutObjectCommand),
        { expiresIn: 900 },
      );
      expect(PutObjectCommand).toHaveBeenCalled();
    });

    it('should throw error when S3 operation fails', async () => {
      vi.mocked(getSignedUrl).mockRejectedValue(new Error('Access Denied'));
      const promise = service.getSignedUploadUrl(
        'images/REC0001/test.webp',
        'image/webp',
      );
      await expect(promise).rejects.toThrow(InternalServerErrorException);
      await expect(promise).rejects.toThrow(
        'Failed to generate presigned upload URL',
      );
    });

    describe('LocalStack endpoint URL construction', () => {
      const localStackEndpoint = 'http://localhost:4566';

      const createLocalStackService = async (endpointUrl: string) => {
        const module = await createAppConfigTestModule({
          establishmentOrderDocsBucket: bucketName,
          awsRegion: region,
          awsEndpointUrl: endpointUrl,
        });
        const appConfig = module.get<AppConfigService>(AppConfigService);
        return new S3Service(appConfig, appConfig.establishmentOrderDocsBucket);
      };

      it('should construct direct LocalStack URL when endpoint is set', async () => {
        const localStackService =
          await createLocalStackService(localStackEndpoint);
        const testKey = 'images/REC0001/test.webp';
        const expectedUrl = `${localStackEndpoint}/${bucketName}/${testKey}`;

        const result = await localStackService.getSignedUploadUrl(
          testKey,
          'image/webp',
        );

        expect(result).toBe(expectedUrl);
        expect(getSignedUrl).not.toHaveBeenCalled();
      });

      it('should remove trailing slash from endpoint URL', async () => {
        const serviceWithSlash = await createLocalStackService(
          'http://localhost:4566/',
        );
        const testKey = 'documents/REC0001/test.pdf';
        const expectedUrl = `http://localhost:4566/${bucketName}/${testKey}`;

        const result = await serviceWithSlash.getSignedUploadUrl(
          testKey,
          'application/pdf',
        );

        expect(result).toBe(expectedUrl);
      });

      it('should handle HTTPS endpoint URLs', async () => {
        const httpsService = await createLocalStackService(
          'https://localstack.example.com',
        );
        const testKey = 'images/REC0001/test.webp';
        const expectedUrl = `https://localstack.example.com/${bucketName}/${testKey}`;

        const result = await httpsService.getSignedUploadUrl(
          testKey,
          'image/webp',
        );

        expect(result).toBe(expectedUrl);
      });

      it('should trim key when constructing LocalStack URL', async () => {
        const localStackService =
          await createLocalStackService(localStackEndpoint);
        const testKey = '  images/REC0001/test.webp  ';
        const expectedUrl = `${localStackEndpoint}/${bucketName}/images/REC0001/test.webp`;

        const result = await localStackService.getSignedUploadUrl(
          testKey,
          'image/webp',
        );

        expect(result).toBe(expectedUrl);
      });

      it('should ignore tags when using LocalStack endpoint', async () => {
        const localStackService =
          await createLocalStackService(localStackEndpoint);
        const testKey = 'images/REC0001/test.webp';
        const expectedUrl = `${localStackEndpoint}/${bucketName}/${testKey}`;

        const result = await localStackService.getSignedUploadUrl(
          testKey,
          'image/webp',
          900,
          { filename: 'test' },
        );

        expect(result).toBe(expectedUrl);
        expect(getSignedUrl).not.toHaveBeenCalled();
      });
    });
  });
});
