import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { ConsentFormsS3Service } from '@/resource-images/service/consent-forms-s3.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Service } from '@/s3/s3.service';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockS3Client,
  setupS3ClientMock,
} from 'test/test-utils/s3-test-utils';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@aws-sdk/client-s3');

describe('ConsentFormsS3Service', () => {
  let service: ConsentFormsS3Service;
  let mockS3Client: Mocked<S3Client>;
  let mockS3Service: Mocked<S3Service>;
  let mockS3Factory: Mocked<S3ServiceFactory>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockS3Client = createMockS3Client();
    setupS3ClientMock(mockS3Client);

    const mockAppConfig = {
      recResourceConsentFormsBucket: 'test-consent-forms-bucket',
    } as any;

    mockS3Service = {
      getBucketName: vi.fn().mockReturnValue('test-consent-forms-bucket'),
      getS3Client: vi.fn().mockReturnValue(mockS3Client),
      deleteFile: vi.fn(),
    } as any;

    mockS3Factory = {
      createForBucket: vi.fn().mockReturnValue(mockS3Service),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        ConsentFormsS3Service,
        {
          provide: AppConfigService,
          useValue: mockAppConfig,
        },
        {
          provide: S3ServiceFactory,
          useValue: mockS3Factory,
        },
      ],
    }).compile();

    service = module.get<ConsentFormsS3Service>(ConsentFormsS3Service);
  });

  describe('uploadConsentForm', () => {
    const recResourceId = 'REC0001';
    const imageId = 'image-123';
    const docId = 'doc-456';
    const buffer = Buffer.from('pdf content');

    it('should upload consent form and return key', async () => {
      const commandInputs: any[] = [];
      vi.mocked(PutObjectCommand).mockImplementation(function (input: any) {
        commandInputs.push(input);
        return { input } as any;
      });
      mockS3Client.send.mockResolvedValueOnce({} as any);

      const result = await service.uploadConsentForm(
        recResourceId,
        imageId,
        docId,
        buffer,
      );

      expect(result).toBe(`${recResourceId}/${imageId}/${docId}.pdf`);
      expect(mockS3Client.send).toHaveBeenCalled();
      expect(commandInputs[0].ContentType).toBe('application/pdf');
      expect(commandInputs[0].Body).toBe(buffer);
    });

    it('should include filename tag when provided', async () => {
      const commandInputs: any[] = [];
      vi.mocked(PutObjectCommand).mockImplementation(function (input: any) {
        commandInputs.push(input);
        return { input } as any;
      });
      mockS3Client.send.mockResolvedValueOnce({} as any);

      await service.uploadConsentForm(
        recResourceId,
        imageId,
        docId,
        buffer,
        'consent-form.pdf',
      );

      expect(commandInputs[0].Tagging).toBe('filename=consent-form.pdf');
    });

    it('should throw on upload error', async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        service.uploadConsentForm(recResourceId, imageId, docId, buffer),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('deleteConsentForm', () => {
    it('should delete consent form from S3', async () => {
      vi.mocked(mockS3Service.deleteFile).mockResolvedValue(undefined);

      await service.deleteConsentForm('REC0001', 'image-123', 'doc-456');

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(
        'REC0001/image-123/doc-456.pdf',
      );
    });

    it('should throw on delete error', async () => {
      vi.mocked(mockS3Service.deleteFile).mockRejectedValueOnce(
        new Error('Delete failed'),
      );

      await expect(
        service.deleteConsentForm('REC0001', 'image-123', 'doc-456'),
      ).rejects.toThrow('Delete failed');
    });
  });
});
