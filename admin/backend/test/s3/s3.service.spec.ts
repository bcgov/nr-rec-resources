import { AppConfigService } from '@/app-config/app-config.service';
import { S3Service } from '@/s3/s3.service';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

describe('S3Service', () => {
  let service: S3Service;
  let mockS3Client: Mocked<S3Client>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockS3Client = {
      send: vi.fn(),
    } as any;

    vi.mocked(S3Client).mockImplementation(() => mockS3Client);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: AppConfigService,
          useValue: {
            establishmentOrderDocsBucket:
              'rst-lza-establishment-order-docs-dev',
            awsRegion: 'ca-central-1',
          },
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize S3Client with correct region', () => {
      expect(S3Client).toHaveBeenCalledWith({
        region: 'ca-central-1',
      });
    });
  });

  describe('getSignedUrl', () => {
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
      const testKey = 'REC0001/document.pdf';
      const expectedUrl = 'https://s3.amazonaws.com/bucket/document.pdf';

      vi.mocked(getSignedUrl).mockResolvedValueOnce(expectedUrl);

      await service.getSignedUrl(testKey);

      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 3600 },
      );
    });

    it('should use custom expiration time when provided', async () => {
      const testKey = 'REC0001/document.pdf';
      const customExpiration = 7200;
      const expectedUrl = 'https://s3.amazonaws.com/bucket/document.pdf';

      vi.mocked(getSignedUrl).mockResolvedValueOnce(expectedUrl);

      await service.getSignedUrl(testKey, customExpiration);

      expect(getSignedUrl).toHaveBeenCalledWith(
        mockS3Client,
        expect.any(GetObjectCommand),
        { expiresIn: 7200 },
      );
    });

    it('should throw error when S3 operation fails', async () => {
      const testKey = 'REC0001/invalid.pdf';
      const error = new Error('Access Denied');

      vi.mocked(getSignedUrl).mockRejectedValueOnce(error);

      await expect(service.getSignedUrl(testKey)).rejects.toThrow(
        'Access Denied',
      );
    });

    it('should create GetObjectCommand with correct parameters', async () => {
      const testKey = 'REC0001/test.pdf';
      vi.mocked(getSignedUrl).mockResolvedValueOnce('https://test-url.com');

      await service.getSignedUrl(testKey);

      const commandCall = vi.mocked(getSignedUrl).mock.calls[0]?.[1];
      expect(commandCall).toBeInstanceOf(GetObjectCommand);
    });
  });

  describe('listObjectsByPrefix', () => {
    it('should return array of objects for valid prefix', async () => {
      const testPrefix = 'REC0001/';
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

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        key: 'REC0001/document1.pdf',
        size: 1024000,
        lastModified: new Date('2024-01-01T00:00:00Z'),
      });
      expect(result[1]).toEqual({
        key: 'REC0001/document2.pdf',
        size: 2048000,
        lastModified: new Date('2024-01-02T00:00:00Z'),
      });
    });

    it('should return empty array when no objects found (response.Contents is undefined)', async () => {
      const testPrefix = 'REC9999/';
      const mockResponse = {};

      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when Contents is empty', async () => {
      const testPrefix = 'REC0000/';
      const mockResponse = {
        Contents: [],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should throw error when S3 operation fails', async () => {
      const testPrefix = 'REC0001/';
      const error = new Error('Network error');

      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(service.listObjectsByPrefix(testPrefix)).rejects.toThrow(
        'Network error',
      );
    });

    it('should map S3 response correctly for multiple objects', async () => {
      const testPrefix = 'REC0002/';
      const date1 = new Date('2024-06-01T10:30:00Z');
      const date2 = new Date('2024-06-02T14:45:00Z');

      const mockResponse = {
        Contents: [
          {
            Key: 'REC0002/file1.pdf',
            Size: 500,
            LastModified: date1,
          },
          {
            Key: 'REC0002/file2.pdf',
            Size: 1500,
            LastModified: date2,
          },
        ],
      };

      mockS3Client.send.mockResolvedValueOnce(mockResponse as any);

      const result = await service.listObjectsByPrefix(testPrefix);

      expect(result).toEqual([
        {
          key: 'REC0002/file1.pdf',
          size: 500,
          lastModified: date1,
        },
        {
          key: 'REC0002/file2.pdf',
          size: 1500,
          lastModified: date2,
        },
      ]);
    });
  });
});
