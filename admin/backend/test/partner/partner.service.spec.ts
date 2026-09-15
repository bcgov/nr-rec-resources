import { AppConfigService } from '@/app-config/app-config.service';
import { PartnerService } from '@/partner/partner.service';
import { CreateAgreementHolderDto } from '@/partner/dtos/create-agreement-holder.dto';
import { PrismaService } from '@/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('PartnerService', () => {
  let service: PartnerService;
  let prisma: {
    recreation_resource: { findUnique: ReturnType<typeof vi.fn> };
    recreation_agreement_holder: {
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    prisma = {
      recreation_resource: { findUnique: vi.fn() },
      recreation_agreement_holder: {
        findUnique: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const appConfig = {
      forestClientApiUrl: 'https://forest-client-api.example.com/',
      forestClientApiKey: 'test-api-key',
    } as AppConfigService;

    service = new PartnerService(appConfig, prisma as unknown as PrismaService);

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  describe('findClientsByRecResourceId', () => {
    it('returns partner details for multiple agreement holder rows', async () => {
      prisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: 'REC0002',
      });
      prisma.recreation_agreement_holder.findMany.mockResolvedValue([
        {
          client_number: '00000002',
          agreement_start_date: new Date('2024-01-01T00:00:00.000Z'),
          agreement_end_date: new Date('2026-12-31T00:00:00.000Z'),
          visible_on_public_website: false,
          partner_relationship_type_code: 'SITE_OPERATOR',
        },
        {
          client_number: '00000003',
          agreement_start_date: new Date('2025-01-01T00:00:00.000Z'),
          agreement_end_date: null,
          visible_on_public_website: true,
          partner_relationship_type_code: 'SITE_OPERATOR',
        },
      ]);
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(
            JSON.stringify({
              clientNumber: '00000002',
              clientName: 'BAXTER',
              legalFirstName: 'JAMES',
              legalMiddleName: 'Canter',
              clientStatusCode: 'ACT',
              clientTypeCode: 'I',
              acronym: 'JAMES BAXTER',
            }),
          ),
          headers: { get: vi.fn().mockReturnValue(null) },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(
            JSON.stringify({
              clientNumber: '00000003',
              clientName: 'SMITH',
              legalFirstName: 'JANE',
              legalMiddleName: 'ALICE',
              clientStatusCode: 'ACT',
              clientTypeCode: 'I',
              acronym: 'JANE SMITH',
            }),
          ),
          headers: { get: vi.fn().mockReturnValue(null) },
        });

      const result = await service.findClientsByRecResourceId('REC0002');

      expect(prisma.recreation_resource.findUnique).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC0002' },
        select: { rec_resource_id: true },
      });
      expect(prisma.recreation_agreement_holder.findMany).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC0002' },
        orderBy: { agreement_holder_id: 'asc' },
        select: {
          client_number: true,
          agreement_start_date: true,
          agreement_end_date: true,
          visible_on_public_website: true,
          partner_relationship_type_code: true,
        },
      });
      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        'https://forest-client-api.example.com/api/clients/findByClientNumber/00000002',
        {
          headers: {
            'X-API-KEY': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        'https://forest-client-api.example.com/api/clients/findByClientNumber/00000003',
        {
          headers: {
            'X-API-KEY': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
      expect(result).toEqual([
        {
          clientNumber: '00000002',
          clientName: 'BAXTER',
          legalFirstName: 'JAMES',
          legalMiddleName: 'Canter',
          clientStatusCode: 'ACT',
          clientStatusDescription: 'Active',
          clientTypeCode: 'I',
          clientTypeDescription: 'Individual',
          acronym: 'JAMES BAXTER',
          agreementStartDate: '2024-01-01',
          agreementEndDate: '2026-12-31',
          visible_on_public_website: false,
          partner_relationship_type_code: 'SITE_OPERATOR',
        },
        {
          clientNumber: '00000003',
          clientName: 'SMITH',
          legalFirstName: 'JANE',
          legalMiddleName: 'ALICE',
          clientStatusCode: 'ACT',
          clientStatusDescription: 'Active',
          clientTypeCode: 'I',
          clientTypeDescription: 'Individual',
          acronym: 'JANE SMITH',
          agreementStartDate: '2025-01-01',
          agreementEndDate: undefined,
          visible_on_public_website: true,
          partner_relationship_type_code: 'SITE_OPERATOR',
        },
      ]);
    });

    it('returns an empty array when no agreement holder client number exists', async () => {
      prisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: 'REC0002',
      });
      prisma.recreation_agreement_holder.findMany.mockResolvedValue([
        {
          client_number: null,
          agreement_start_date: null,
          agreement_end_date: null,
          visible_on_public_website: false,
          partner_relationship_type_code: 'SITE_OPERATOR',
        },
      ]);

      const result = await service.findClientsByRecResourceId('REC0002');

      expect(result).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the recreation resource does not exist', async () => {
      prisma.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.findClientsByRecResourceId('REC9999'),
      ).rejects.toThrow(NotFoundException);

      expect(
        prisma.recreation_agreement_holder.findMany,
      ).not.toHaveBeenCalled();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('searchClient', () => {
    it('uses findByClientNumber and returns an enriched client record', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            clientNumber: '00000002',
            clientName: 'BAXTER',
            legalFirstName: 'JAMES',
            legalMiddleName: 'Canter',
            clientStatusCode: 'ACT',
            clientTypeCode: 'I',
            acronym: 'JAMES BAXTER',
          }),
        ),
        headers: { get: vi.fn().mockReturnValue(null) },
      });

      const result = await service.searchClient('00000002');

      expect(fetchMock).toHaveBeenCalledWith(
        'https://forest-client-api.example.com/api/clients/findByClientNumber/00000002',
        {
          headers: {
            'X-API-KEY': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
      expect(result).toEqual({
        clientNumber: '00000002',
        clientName: 'BAXTER',
        legalFirstName: 'JAMES',
        legalMiddleName: 'Canter',
        clientStatusCode: 'ACT',
        clientStatusDescription: 'Active',
        clientTypeCode: 'I',
        clientTypeDescription: 'Individual',
        acronym: 'JAMES BAXTER',
      });
    });
  });

  describe('searchByAcronymNameNumber', () => {
    it('calls the upstream search/by endpoint with provided filters', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              clientNumber: '00000002',
              clientName: 'BAXTER',
              clientStatusCode: 'ACT',
              clientTypeCode: 'I',
            },
          ]),
        ),
        headers: { get: vi.fn().mockReturnValue('1') },
      });

      const result = await service.searchByAcronymNameNumber(
        0,
        10,
        'BAXTER',
        'JB',
        '00000002',
      );

      expect(fetchMock).toHaveBeenCalledWith(
        'https://forest-client-api.example.com/api/clients/search/by?page=0&size=10&name=BAXTER&acronym=JB&number=00000002',
        {
          headers: {
            'X-API-KEY': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
      expect(result.totalCount).toBe(1);
      expect(result.data[0]).toMatchObject({
        clientNumber: '00000002',
        clientStatusDescription: 'Active',
        clientTypeDescription: 'Individual',
      });
    });
  });

  describe('listClientLocations', () => {
    it('returns client locations enriched with readable status and type names', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(
            JSON.stringify({
              clientNumber: '00000002',
              clientName: 'BAXTER',
              legalFirstName: 'JAMES',
              legalMiddleName: 'Canter',
              clientStatusCode: 'ACT',
              clientTypeCode: 'I',
              acronym: 'JAMES BAXTER',
            }),
          ),
          headers: { get: vi.fn().mockReturnValue(null) },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(
            JSON.stringify([
              {
                locationCode: '00',
                locationName: 'Office',
                city: 'NANAIMO',
              },
            ]),
          ),
          headers: { get: vi.fn().mockReturnValue('1') },
        });

      const result = await service.listClientLocations('00000002');

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        'https://forest-client-api.example.com/api/clients/findByClientNumber/00000002',
        {
          headers: {
            'X-API-KEY': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        'https://forest-client-api.example.com/api/clients/00000002/locations?page=0&size=100',
        {
          headers: {
            'X-API-KEY': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
      expect(
        prisma.recreation_agreement_holder.findFirst,
      ).not.toHaveBeenCalled();
      expect(result).toEqual([
        {
          clientNumber: '00000002',
          clientName: 'BAXTER',
          legalFirstName: 'JAMES',
          legalMiddleName: 'Canter',
          clientStatusCode: 'ACT',
          clientStatusDescription: 'Active',
          clientTypeCode: 'I',
          clientTypeDescription: 'Individual',
          acronym: 'JAMES BAXTER',
          locationCode: '00',
          locationName: 'Office',
          city: 'NANAIMO',
        },
      ]);
    });

    it('fetches multiple location pages when the upstream total count exceeds one page', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(
            JSON.stringify({
              clientNumber: '00000002',
              clientName: 'BAXTER',
              clientStatusCode: 'ACT',
              clientTypeCode: 'I',
            }),
          ),
          headers: { get: vi.fn().mockReturnValue(null) },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(
            JSON.stringify(
              Array.from({ length: 100 }, (_, index) => ({
                locationCode: String(index).padStart(2, '0'),
              })),
            ),
          ),
          headers: { get: vi.fn().mockReturnValue('101') },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi
            .fn()
            .mockResolvedValue(JSON.stringify([{ locationCode: '100' }])),
          headers: { get: vi.fn().mockReturnValue('101') },
        });

      const result = await service.listClientLocations('00000002');

      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        'https://forest-client-api.example.com/api/clients/00000002/locations?page=1&size=100',
        {
          headers: {
            'X-API-KEY': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
      expect(result).toHaveLength(101);
    });
  });

  describe('createAgreementHolder', () => {
    it('creates a new agreement holder when the resource exists and no record is present', async () => {
      const createDto: CreateAgreementHolderDto = {
        clientNumber: '00000002',
        agreementStartDate: '2024-01-01',
        agreementEndDate: '2026-12-31',
      };

      prisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: 'REC0002',
      });
      prisma.recreation_agreement_holder.findFirst.mockResolvedValue(null);
      prisma.recreation_agreement_holder.create.mockResolvedValue({
        client_number: '00000002',
        agreement_start_date: new Date('2024-01-01T00:00:00.000Z'),
        agreement_end_date: new Date('2026-12-31T00:00:00.000Z'),
        visible_on_public_website: false,
        partner_relationship_type_code: 'SITE_OPERATOR',
      });
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            clientNumber: '00000002',
            clientName: 'BAXTER',
            clientStatusCode: 'ACT',
            clientTypeCode: 'I',
          }),
        ),
        headers: { get: vi.fn().mockReturnValue(null) },
      });

      const result = await service.createAgreementHolder('REC0002', createDto);

      expect(prisma.recreation_agreement_holder.create).toHaveBeenCalledWith({
        data: {
          rec_resource_id: 'REC0002',
          client_number: '00000002',
          agreement_start_date: new Date('2024-01-01'),
          agreement_end_date: new Date('2026-12-31'),
          visible_on_public_website: false,
          partner_relationship_type_code: 'SITE_OPERATOR',
        },
        select: {
          client_number: true,
          agreement_start_date: true,
          agreement_end_date: true,
          visible_on_public_website: true,
          partner_relationship_type_code: true,
        },
      });
      expect(result).toEqual({
        clientNumber: '00000002',
        clientName: 'BAXTER',
        clientStatusCode: 'ACT',
        clientStatusDescription: 'Active',
        clientTypeCode: 'I',
        clientTypeDescription: 'Individual',
        agreementStartDate: '2024-01-01',
        agreementEndDate: '2026-12-31',
        visible_on_public_website: false,
        partner_relationship_type_code: 'SITE_OPERATOR',
      });
    });

    it('uses provided visibility and relationship type values from the payload', async () => {
      const createDto: CreateAgreementHolderDto = {
        clientNumber: '00000002',
        visible_on_public_website: true,
        partner_relationship_type_code: 'DISTRICT_MANAGER',
      };

      prisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: 'REC0002',
      });
      prisma.recreation_agreement_holder.findFirst.mockResolvedValue(null);
      prisma.recreation_agreement_holder.create.mockResolvedValue({
        client_number: '00000002',
        agreement_start_date: null,
        agreement_end_date: null,
        visible_on_public_website: true,
        partner_relationship_type_code: 'DISTRICT_MANAGER',
      });
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue(
          JSON.stringify({
            clientNumber: '00000002',
            clientName: 'BAXTER',
            clientStatusCode: 'ACT',
            clientTypeCode: 'I',
          }),
        ),
        headers: { get: vi.fn().mockReturnValue(null) },
      });

      await service.createAgreementHolder('REC0002', createDto);

      expect(prisma.recreation_agreement_holder.create).toHaveBeenCalledWith({
        data: {
          rec_resource_id: 'REC0002',
          client_number: '00000002',
          agreement_start_date: null,
          agreement_end_date: null,
          visible_on_public_website: true,
          partner_relationship_type_code: 'DISTRICT_MANAGER',
        },
        select: {
          client_number: true,
          agreement_start_date: true,
          agreement_end_date: true,
          visible_on_public_website: true,
          partner_relationship_type_code: true,
        },
      });
    });

    it('throws ConflictException when the same client is already assigned to the resource', async () => {
      const createDto: CreateAgreementHolderDto = {
        clientNumber: '00000002',
      };

      prisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: 'REC0002',
      });
      prisma.recreation_agreement_holder.findFirst.mockResolvedValue({
        client_number: '00000002',
        agreement_start_date: null,
        agreement_end_date: null,
      });

      await expect(
        service.createAgreementHolder('REC0002', createDto),
      ).rejects.toThrow(ConflictException);

      expect(prisma.recreation_agreement_holder.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when a different client is already assigned to the resource', async () => {
      const createDto: CreateAgreementHolderDto = {
        clientNumber: '00000003',
      };

      prisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: 'REC0002',
      });
      prisma.recreation_agreement_holder.findFirst.mockResolvedValue({
        client_number: '00000002',
        agreement_start_date: null,
        agreement_end_date: null,
      });

      await expect(
        service.createAgreementHolder('REC0002', createDto),
      ).rejects.toThrow(ConflictException);

      expect(prisma.recreation_agreement_holder.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the recreation resource does not exist', async () => {
      const createDto: CreateAgreementHolderDto = {
        clientNumber: '00000002',
      };

      prisma.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.createAgreementHolder('REC9999', createDto),
      ).rejects.toThrow(NotFoundException);

      expect(
        prisma.recreation_agreement_holder.findFirst,
      ).not.toHaveBeenCalled();
    });
  });

  describe('updateAgreementHolder', () => {
    const holder = (overrides: Record<string, unknown> = {}) => ({
      agreement_holder_id: 1000001,
      rec_resource_id: 'REC0002',
      client_number: '00123456',
      agreement_start_date: new Date('2024-01-01T00:00:00Z'),
      agreement_end_date: new Date('2026-12-31T00:00:00Z'),
      visible_on_public_website: true,
      partner_relationship_type_code: 'SITE_OPERATOR',
      cancelled: false,
      ...overrides,
    });

    const mockClientFetch = () =>
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => JSON.stringify({ clientNumber: '00123456' }),
      });

    it('rejects an empty payload', async () => {
      await expect(
        service.updateAgreementHolder('REC0002', 1000001, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('addresses the holder by id, not by resource', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(holder());
      prisma.recreation_agreement_holder.update.mockResolvedValue(holder());
      mockClientFetch();

      await service.updateAgreementHolder('REC0002', 1000001, {
        visible_on_public_website: false,
      });

      expect(
        prisma.recreation_agreement_holder.findUnique,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ where: { agreement_holder_id: 1000001 } }),
      );
      expect(prisma.recreation_agreement_holder.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { agreement_holder_id: 1000001 } }),
      );
    });

    it('404s when the holder belongs to a different resource', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(
        holder({ rec_resource_id: 'REC9999' }),
      );

      await expect(
        service.updateAgreementHolder('REC0002', 1000001, {
          visible_on_public_website: false,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.recreation_agreement_holder.update).not.toHaveBeenCalled();
    });

    it('404s when the holder does not exist', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAgreementHolder('REC0002', 1000001, {
          visible_on_public_website: false,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('clears a date when null is sent, and leaves an omitted date alone', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(holder());
      prisma.recreation_agreement_holder.update.mockResolvedValue(
        holder({ agreement_end_date: null }),
      );
      mockClientFetch();

      await service.updateAgreementHolder('REC0002', 1000001, {
        agreementEndDate: null,
      });

      const data =
        prisma.recreation_agreement_holder.update.mock.calls[0]?.[0]?.data;
      expect(data.agreement_end_date).toBeNull();
      // undefined leaves the column untouched rather than nulling it
      expect(data.agreement_start_date).toBeUndefined();
    });

    it('rejects an end date that is not after the start date', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(holder());

      await expect(
        service.updateAgreementHolder('REC0002', 1000001, {
          agreementEndDate: '2023-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.recreation_agreement_holder.update).not.toHaveBeenCalled();
    });

    it('validates the edited date against the persisted one', async () => {
      // Only the start date is sent; it must still be checked against the
      // end date already stored on the row.
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(holder());

      await expect(
        service.updateAgreementHolder('REC0002', 1000001, {
          agreementStartDate: '2027-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('allows a date pair where only one side is set', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(
        holder({ agreement_end_date: null }),
      );
      prisma.recreation_agreement_holder.update.mockResolvedValue(holder());
      mockClientFetch();

      await expect(
        service.updateAgreementHolder('REC0002', 1000001, {
          agreementStartDate: '2027-01-01',
        }),
      ).resolves.toBeDefined();
    });

    it('rejects un-cancelling an already-cancelled agreement', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(
        holder({ cancelled: true }),
      );

      await expect(
        service.updateAgreementHolder('REC0002', 1000001, {
          cancelled: false,
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.recreation_agreement_holder.update).not.toHaveBeenCalled();
    });

    it('allows cancelling an active agreement', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue(holder());
      prisma.recreation_agreement_holder.update.mockResolvedValue(
        holder({ cancelled: true }),
      );
      mockClientFetch();

      const result = await service.updateAgreementHolder('REC0002', 1000001, {
        cancelled: true,
      });

      expect(result.cancelled).toBe(true);
    });
  });

  describe('deleteAgreementHolder', () => {
    it('deletes a holder owned by the resource', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue({
        agreement_holder_id: 1000001,
        rec_resource_id: 'REC0002',
        cancelled: false,
      });
      prisma.recreation_agreement_holder.delete.mockResolvedValue({});

      await service.deleteAgreementHolder('REC0002', 1000001);

      expect(prisma.recreation_agreement_holder.delete).toHaveBeenCalledWith({
        where: { agreement_holder_id: 1000001 },
      });
    });

    it('404s rather than deleting a holder owned by another resource', async () => {
      prisma.recreation_agreement_holder.findUnique.mockResolvedValue({
        agreement_holder_id: 1000001,
        rec_resource_id: 'REC9999',
        cancelled: false,
      });

      await expect(
        service.deleteAgreementHolder('REC0002', 1000001),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.recreation_agreement_holder.delete).not.toHaveBeenCalled();
    });
  });

  describe('private helper coverage', () => {
    it('expands query-string and comma-separated id values', () => {
      expect(
        (service as any).expandIdValue('?id=00000001&id=00000002'),
      ).toEqual(['00000001', '00000002']);
      expect((service as any).expandIdValue('00000001,00000002')).toEqual([
        '00000001',
        '00000002',
      ]);
      expect((service as any).expandIdValue('')).toEqual([]);
    });

    it('returns null for tryFetchClientByClientNumber on 404 and rethrows other errors', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue('Client not found'),
        headers: { get: vi.fn().mockReturnValue(null) },
      });

      await expect(
        (service as any).tryFetchClientByClientNumber('00000099'),
      ).resolves.toBeNull();

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Invalid Client Number'),
        headers: { get: vi.fn().mockReturnValue(null) },
      });

      await expect(
        (service as any).tryFetchClientByClientNumber('bad-id'),
      ).rejects.toThrow('Invalid Client Number');
    });

    it('returns an empty array when the first upstream locations page is empty', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(
            JSON.stringify({
              clientNumber: '00000002',
              clientName: 'BAXTER',
              clientStatusCode: 'ACT',
              clientTypeCode: 'I',
            }),
          ),
          headers: { get: vi.fn().mockReturnValue(null) },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: vi.fn().mockResolvedValue(JSON.stringify([])),
          headers: { get: vi.fn().mockReturnValue('0') },
        });

      await expect(service.listClientLocations('00000002')).resolves.toEqual(
        [],
      );
    });
  });
});
