import { AdvisoriesService } from '@/recreation-resources/advisories/advisories.service';
import { PrismaService } from '@/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('AdvisoriesService', () => {
  let service: AdvisoriesService;
  let module: TestingModule;

  const mockPrismaService = {
    act_advisories_flat: {
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AdvisoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdvisoriesService>(AdvisoriesService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  const REC_RESOURCE_ID = 'REC262200';

  const makeDbRow = (overrides: Record<string, unknown> = {}) => ({
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
    published_at: new Date('2027-01-01T00:00:00Z'),
    submitted_by: 'Jane Doe',
    is_advisory_date_displayed: true,
    is_effective_date_displayed: true,
    is_end_date_displayed: false,
    is_updated_date_displayed: true,
    ...overrides,
  });

  describe('findAdvisoriesByRecResourceId', () => {
    it('returns mapped DTO for a single advisory', async () => {
      const row = makeDbRow();
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([row]);

      const result =
        await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
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
        published_at: new Date('2027-01-01T00:00:00Z'),
        submitted_by: 'Jane Doe',
        is_advisory_date_displayed: true,
        is_effective_date_displayed: true,
        is_end_date_displayed: false,
        is_updated_date_displayed: true,
      });
    });

    it('returns empty array when no advisories exist for the resource', async () => {
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([]);

      const result =
        await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(result).toEqual([]);
    });

    it('returns multiple advisories mapped from prisma results', async () => {
      const rows = [
        makeDbRow({ advisory_number: 1001, urgency: 'High' }),
        makeDbRow({ advisory_number: 1002, urgency: 'Medium' }),
        makeDbRow({ advisory_number: 1003, urgency: 'Low' }),
      ];
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue(rows);

      const result =
        await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(result).toHaveLength(3);
      expect(result[0].advisory_number).toBe(1001);
      expect(result[1].advisory_number).toBe(1002);
      expect(result[2].advisory_number).toBe(1003);
    });

    it('queries prisma with the correct rec_resource_id filter', async () => {
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([]);

      await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(
        mockPrismaService.act_advisories_flat.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rec_resource_id: REC_RESOURCE_ID },
        }),
      );
    });

    it('queries prisma with the correct priority ordering', async () => {
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([]);

      await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(
        mockPrismaService.act_advisories_flat.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { listing_rank: 'desc' },
            { urgency_sequence: 'desc' },
            { access_status_precedence: 'asc' },
            { event_type_precedence: 'asc' },
            { advisory_date: 'desc' },
          ],
        }),
      );
    });

    it('selects only the expected fields from prisma', async () => {
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([]);

      await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(
        mockPrismaService.act_advisories_flat.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            advisory_number: true,
            event_type: true,
            access_status_name: true,
            advisory_status: true,
            urgency: true,
            effective_date: true,
            end_date: true,
            expiry_date: true,
            updated_date: true,
            published_at: true,
            submitted_by: true,
          }),
        }),
      );
    });

    it('maps null optional fields (end_date, expiry_date, published_at) correctly', async () => {
      const row = makeDbRow({
        end_date: null,
        expiry_date: null,
        published_at: null,
      });
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([row]);

      const result =
        await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(result[0].end_date).toBeNull();
      expect(result[0].expiry_date).toBeNull();
      expect(result[0].published_at).toBeNull();
    });

    it('maps non-null optional date fields correctly', async () => {
      const endDate = new Date('2027-03-01T00:00:00Z');
      const expiryDate = new Date('2027-06-01T00:00:00Z');
      const publishedAt = new Date('2027-01-05T00:00:00Z');
      const row = makeDbRow({
        end_date: endDate,
        expiry_date: expiryDate,
        published_at: publishedAt,
      });
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([row]);

      const result =
        await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(result[0].end_date).toEqual(endDate);
      expect(result[0].expiry_date).toEqual(expiryDate);
      expect(result[0].published_at).toEqual(publishedAt);
    });

    it('maps boolean display flags from prisma result', async () => {
      const row = makeDbRow({
        is_advisory_date_displayed: false,
        is_effective_date_displayed: false,
        is_end_date_displayed: true,
        is_updated_date_displayed: false,
      });
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([row]);

      const result =
        await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(result[0].is_advisory_date_displayed).toBe(false);
      expect(result[0].is_effective_date_displayed).toBe(false);
      expect(result[0].is_end_date_displayed).toBe(true);
      expect(result[0].is_updated_date_displayed).toBe(false);
    });

    it('propagates prisma errors to the caller', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.act_advisories_flat.findMany.mockRejectedValue(error);

      await expect(
        service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID),
      ).rejects.toThrow('Database connection failed');
    });

    it('calls findMany exactly once per invocation', async () => {
      mockPrismaService.act_advisories_flat.findMany.mockResolvedValue([]);

      await service.findAdvisoriesByRecResourceId(REC_RESOURCE_ID);

      expect(
        mockPrismaService.act_advisories_flat.findMany,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
