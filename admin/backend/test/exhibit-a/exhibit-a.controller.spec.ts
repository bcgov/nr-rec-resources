import { ExhibitAController } from '@/exhibit-a/exhibit-a.controller';
import {
  CreateExhibitAByApplicationGuidRequestDto,
  ExhibitAPageOrientation,
  ExhibitAPageSize,
} from '@/exhibit-a/dto/generate-exhibit-a.dto';
import { ExhibitAService } from '@/exhibit-a/exhibit-a.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('ExhibitAController', () => {
  let controller: ExhibitAController;
  let service: {
    createOrGetByApplicationGuid: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    service = {
      createOrGetByApplicationGuid: vi.fn().mockResolvedValue({
        submissionId: 'S1234567',
        pdfUrl: 'https://example.com/s3/exhibit-a-123.pdf',
        size: ExhibitAPageSize.B,
        orientation: ExhibitAPageOrientation.Landscape,
        scale: 30000,
      }),
    };
    controller = new ExhibitAController(service as unknown as ExhibitAService);
  });

  it('handles POST application_guid endpoint', async () => {
    const payload: CreateExhibitAByApplicationGuidRequestDto = {
      userId: 'TESTER1',
      generate: true,
      adjudicationComments: [
        {
          actionCode: 'READY',
          actionComment: 'ready to generate',
        },
      ],
      size: ExhibitAPageSize.C,
      orientation: ExhibitAPageOrientation.Portrait,
      scale: 30000,
    };

    const result = await controller.createOrGetByApplicationGuid(
      '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
      payload,
    );

    expect(service.createOrGetByApplicationGuid).toHaveBeenCalledWith(
      '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
      payload,
    );
    expect(result).toEqual({
      submissionId: 'S1234567',
      pdfUrl: 'https://example.com/s3/exhibit-a-123.pdf',
      size: ExhibitAPageSize.B,
      orientation: ExhibitAPageOrientation.Landscape,
      scale: 30000,
    });
  });
});
