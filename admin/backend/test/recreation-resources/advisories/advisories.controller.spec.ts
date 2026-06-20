import { AdvisoriesController } from '@/recreation-resources/advisories/advisories.controller';
import { AdvisoriesService } from '@/recreation-resources/advisories/advisories.service';
import { RecreationResourceAdvisoryDto } from '@/recreation-resources/advisories/dto/recreation-resource-advisory.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AdvisoriesController', () => {
  let controller: AdvisoriesController;
  let service: AdvisoriesService;
  let module: TestingModule;

  const mockAdvisoriesService = {
    findAdvisoriesByRecResourceId: vi.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AdvisoriesController],
      providers: [
        {
          provide: AdvisoriesService,
          useValue: mockAdvisoriesService,
        },
      ],
    }).compile();

    controller = module.get<AdvisoriesController>(AdvisoriesController);
    service = module.get<AdvisoriesService>(AdvisoriesService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAdvisories', () => {
    const REC_RESOURCE_ID = 'REC262200';

    const mockAdvisory: RecreationResourceAdvisoryDto = {
      advisory_number: 3189,
      event_type: 'General Public Safety',
      access_status_name: 'Closure',
      advisory_status: 'Published',
      urgency: 'High',
      advisory_date: new Date('2027-01-01T00:00:00Z'),
      effective_date: new Date('2027-01-01T00:00:00Z'),
      end_date: null,
      expiry_date: null,
      updated_date: new Date('2027-01-15T00:00:00Z'),
      published_at: null,
      submitted_by: 'Jane Doe',
      is_advisory_date_displayed: true,
      is_effective_date_displayed: true,
      is_end_date_displayed: false,
      is_updated_date_displayed: true,
    };

    it('calls service.findAdvisoriesByRecResourceId with the rec_resource_id param', async () => {
      mockAdvisoriesService.findAdvisoriesByRecResourceId.mockResolvedValue([]);

      await controller.getAdvisories(REC_RESOURCE_ID);

      expect(service.findAdvisoriesByRecResourceId).toHaveBeenCalledWith(
        REC_RESOURCE_ID,
      );
      expect(service.findAdvisoriesByRecResourceId).toHaveBeenCalledTimes(1);
    });

    it('returns the advisory list from the service', async () => {
      mockAdvisoriesService.findAdvisoriesByRecResourceId.mockResolvedValue([
        mockAdvisory,
      ]);

      const result = await controller.getAdvisories(REC_RESOURCE_ID);

      expect(result).toEqual([mockAdvisory]);
    });

    it('returns empty array when no advisories exist', async () => {
      mockAdvisoriesService.findAdvisoriesByRecResourceId.mockResolvedValue([]);

      const result = await controller.getAdvisories(REC_RESOURCE_ID);

      expect(result).toEqual([]);
    });

    it('returns multiple advisories from the service', async () => {
      const advisories = [
        { ...mockAdvisory, advisory_number: 1001 },
        { ...mockAdvisory, advisory_number: 1002 },
      ];
      mockAdvisoriesService.findAdvisoriesByRecResourceId.mockResolvedValue(
        advisories,
      );

      const result = await controller.getAdvisories(REC_RESOURCE_ID);

      expect(result).toHaveLength(2);
      expect(result[0].advisory_number).toBe(1001);
      expect(result[1].advisory_number).toBe(1002);
    });

    it('propagates errors thrown by the service', async () => {
      const error = new Error('Unexpected service error');
      mockAdvisoriesService.findAdvisoriesByRecResourceId.mockRejectedValue(
        error,
      );

      await expect(controller.getAdvisories(REC_RESOURCE_ID)).rejects.toThrow(
        'Unexpected service error',
      );
    });

    it('uses the exact rec_resource_id passed as the route param', async () => {
      mockAdvisoriesService.findAdvisoriesByRecResourceId.mockResolvedValue([]);
      const specificId = 'REC999999';

      await controller.getAdvisories(specificId);

      expect(service.findAdvisoriesByRecResourceId).toHaveBeenCalledWith(
        specificId,
      );
    });
  });
});
