import { ExhibitADocsController } from '@/exhibit-a-docs/exhibit-a-docs.controller';
import { ExhibitADocsService } from '@/exhibit-a-docs/exhibit-a-docs.service';
import {
  ExhibitADocDto,
  FinalizeExhibitAUploadRequestDto,
  PresignExhibitAUploadResponseDto,
} from '@/exhibit-a-docs/dto/exhibit-a-doc.dto';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const REC_RESOURCE_ID = 'REC0001';
const DOC_ID = 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9';
const S3_KEY = `${REC_RESOURCE_ID}/${DOC_ID}/exhibit-a.pdf`;

const mockDoc: ExhibitADocDto = {
  document_id: DOC_ID,
  rec_resource_id: REC_RESOURCE_ID,
  file_name: 'exhibit-a',
  extension: 'pdf',
  file_size: 1024,
  s3_key: S3_KEY,
  url: 'http://localhost:4566/bucket/' + S3_KEY,
  created_at: new Date('2024-01-01'),
};

const mockPresignResponse: PresignExhibitAUploadResponseDto = {
  document_id: DOC_ID,
  key: S3_KEY,
  url: 'http://localhost:4566/bucket/' + S3_KEY,
};

const mockService = {
  getAll: vi.fn(),
  presignUpload: vi.fn(),
  finalizeUpload: vi.fn(),
  delete: vi.fn(),
};

describe('ExhibitADocsController', () => {
  let controller: ExhibitADocsController;
  let service: ExhibitADocsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ExhibitADocsController],
      providers: [{ provide: ExhibitADocsService, useValue: mockService }],
    }).compile();

    controller = module.get<ExhibitADocsController>(ExhibitADocsController);
    service = module.get<ExhibitADocsService>(ExhibitADocsService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('getAll', () => {
    it('should return all exhibit-a docs for a resource', async () => {
      mockService.getAll.mockResolvedValue([mockDoc]);

      const result = await controller.getAll(REC_RESOURCE_ID);

      expect(result).toEqual([mockDoc]);
      expect(service.getAll).toHaveBeenCalledWith(REC_RESOURCE_ID);
    });

    it('should return empty array when no docs exist', async () => {
      mockService.getAll.mockResolvedValue([]);

      const result = await controller.getAll(REC_RESOURCE_ID);

      expect(result).toEqual([]);
    });

    it('should propagate HttpException from service', async () => {
      mockService.getAll.mockRejectedValue(new HttpException('Not found', 404));

      await expect(controller.getAll(REC_RESOURCE_ID)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('presignUpload', () => {
    it('should return presigned upload URL', async () => {
      mockService.presignUpload.mockResolvedValue(mockPresignResponse);

      const result = await controller.presignUpload(
        REC_RESOURCE_ID,
        'exhibit-a.pdf',
      );

      expect(result).toEqual(mockPresignResponse);
      expect(service.presignUpload).toHaveBeenCalledWith(
        REC_RESOURCE_ID,
        'exhibit-a.pdf',
      );
    });

    it('should propagate 404 when resource not found', async () => {
      mockService.presignUpload.mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );

      await expect(
        controller.presignUpload(REC_RESOURCE_ID, 'exhibit-a.pdf'),
      ).rejects.toThrow(
        new HttpException('Recreation Resource not found', 404),
      );
    });
  });

  describe('finalizeUpload', () => {
    const body: FinalizeExhibitAUploadRequestDto = {
      document_id: DOC_ID,
      file_name: 'exhibit-a',
      extension: 'pdf',
      file_size: 1024,
    };

    it('should finalize upload and return created doc', async () => {
      mockService.finalizeUpload.mockResolvedValue(mockDoc);

      const result = await controller.finalizeUpload(REC_RESOURCE_ID, body);

      expect(result).toEqual(mockDoc);
      expect(service.finalizeUpload).toHaveBeenCalledWith(
        REC_RESOURCE_ID,
        body,
      );
    });

    it('should propagate 404 when resource not found', async () => {
      mockService.finalizeUpload.mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );

      await expect(
        controller.finalizeUpload(REC_RESOURCE_ID, body),
      ).rejects.toThrow(HttpException);
    });

    it('should propagate 500 on unexpected error', async () => {
      mockService.finalizeUpload.mockRejectedValue(
        new HttpException('Failed to finalize upload', 500),
      );

      await expect(
        controller.finalizeUpload(REC_RESOURCE_ID, body),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete doc and return deleted record', async () => {
      mockService.delete.mockResolvedValue(mockDoc);

      const result = await controller.delete(REC_RESOURCE_ID, DOC_ID);

      expect(result).toEqual(mockDoc);
      expect(service.delete).toHaveBeenCalledWith(REC_RESOURCE_ID, DOC_ID);
    });

    it('should propagate 404 when doc not found', async () => {
      mockService.delete.mockRejectedValue(
        new HttpException('Exhibit A document not found', 404),
      );

      await expect(controller.delete(REC_RESOURCE_ID, DOC_ID)).rejects.toThrow(
        new HttpException('Exhibit A document not found', 404),
      );
    });
  });
});
