import { PartnerController } from '@/partner/partner.controller';
import { PartnerService } from '@/partner/partner.service';
import { AgreementHolderClientPublicViewDto } from '@/partner/dtos/agreement-holder-client-public-view.dto';
import { CreateAgreementHolderDto } from '@/partner/dtos/create-agreement-holder.dto';
import { UpdateAgreementHolderDto } from '@/partner/dtos/update-agreement-holder.dto';
import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('PartnerController', () => {
  let controller: PartnerController;
  let service: PartnerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PartnerController],
      providers: [
        {
          provide: PartnerService,
          useValue: {
            searchByAcronymNameNumber: vi.fn(),
            searchClient: vi.fn(),
            findClientsByRecResourceId: vi.fn(),
            createAgreementHolder: vi.fn(),
            updateAgreementHolder: vi.fn(),
            listClientLocations: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(PartnerController);
    service = moduleRef.get(PartnerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findClientsByRecResourceId', () => {
    it('delegates to the service and returns partner data', async () => {
      const expected: AgreementHolderClientPublicViewDto[] = [
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
          visible_on_public_website: true,
          partner_relationship_type_code: 'SITE_OPERATOR',
        },
      ];

      vi.spyOn(service, 'findClientsByRecResourceId').mockResolvedValue(
        expected,
      );

      const result = await controller.findClientsByRecResourceId('REC0002');

      expect(service.findClientsByRecResourceId).toHaveBeenCalledWith(
        'REC0002',
      );
      expect(result).toEqual(expected);
    });
  });

  describe('searchByAcronymNameNumber', () => {
    it('sets the total count header and returns partner results', async () => {
      const response = { setHeader: vi.fn() } as any;
      const expected = [
        {
          clientNumber: '00000002',
          clientName: 'BAXTER',
        },
      ];

      vi.spyOn(service, 'searchByAcronymNameNumber').mockResolvedValue({
        data: expected,
        totalCount: 1,
      });

      const result = await controller.searchByAcronymNameNumber(
        0,
        10,
        response,
        'BAXTER',
        undefined,
        undefined,
      );

      expect(service.searchByAcronymNameNumber).toHaveBeenCalledWith(
        0,
        10,
        'BAXTER',
        undefined,
        undefined,
      );
      expect(response.setHeader).toHaveBeenCalledWith('X-Total-Count', '1');
      expect(result).toEqual(expected);
    });

    it('does not set the total count header when no total count is provided', async () => {
      const response = { setHeader: vi.fn() } as any;

      vi.spyOn(service, 'searchByAcronymNameNumber').mockResolvedValue({
        data: [],
        totalCount: null,
      });

      const result = await controller.searchByAcronymNameNumber(
        0,
        10,
        response,
      );

      expect(response.setHeader).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('searchClient', () => {
    it('delegates to the service and returns a single client', async () => {
      const expected = {
        clientNumber: '00000002',
        clientName: 'BAXTER',
        legalFirstName: 'JAMES',
        legalMiddleName: 'Canter',
        clientStatusCode: 'ACT',
        clientStatusDescription: 'Active',
        clientTypeCode: 'I',
        clientTypeDescription: 'Individual',
        acronym: 'JAMES BAXTER',
      };

      vi.spyOn(service, 'searchClient').mockResolvedValue(expected);

      const result = await controller.searchClient('00000002');

      expect(service.searchClient).toHaveBeenCalledWith('00000002');
      expect(result).toEqual(expected);
    });

    it('throws when client_id is missing', async () => {
      await expect(controller.searchClient('   ')).rejects.toThrow(
        HttpException,
      );

      expect(service.searchClient).not.toHaveBeenCalled();
    });
  });

  describe('listClientLocations', () => {
    it('delegates to the service and returns location data', async () => {
      const expected = [
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
        },
      ];

      vi.spyOn(service, 'listClientLocations').mockResolvedValue(expected);

      const result = await controller.listClientLocations('00000002');

      expect(service.listClientLocations).toHaveBeenCalledWith('00000002');
      expect(result).toEqual(expected);
    });
  });

  describe('createAgreementHolder', () => {
    it('delegates to the service and returns the created agreement holder', async () => {
      const createDto: CreateAgreementHolderDto = {
        clientNumber: '00000002',
        agreementStartDate: '2024-01-01',
        agreementEndDate: '2026-12-31',
        visible_on_public_website: false,
        partner_relationship_type_code: 'SITE_OPERATOR',
      };
      const expected: AgreementHolderClientPublicViewDto = {
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
      };

      vi.spyOn(service, 'createAgreementHolder').mockResolvedValue(expected);

      const result = await controller.createAgreementHolder(
        'REC0002',
        createDto,
      );

      expect(service.createAgreementHolder).toHaveBeenCalledWith(
        'REC0002',
        createDto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateAgreementHolder', () => {
    it('delegates to the service and returns the updated agreement holder', async () => {
      const updateDto: UpdateAgreementHolderDto = {
        agreementStartDate: '2024-02-01',
        agreementEndDate: '2026-11-30',
        visible_on_public_website: true,
        partner_relationship_type_code: 'DISTRICT_MANAGER',
      };
      const expected: AgreementHolderClientPublicViewDto = {
        clientNumber: '00000002',
        clientName: 'BAXTER',
        clientStatusCode: 'ACT',
        clientStatusDescription: 'Active',
        clientTypeCode: 'I',
        clientTypeDescription: 'Individual',
        agreementStartDate: '2024-02-01',
        agreementEndDate: '2026-11-30',
        visible_on_public_website: true,
        partner_relationship_type_code: 'DISTRICT_MANAGER',
      };

      vi.spyOn(service, 'updateAgreementHolder').mockResolvedValue(expected);

      const result = await controller.updateAgreementHolder(
        'REC0002',
        updateDto,
      );

      expect(service.updateAgreementHolder).toHaveBeenCalledWith(
        'REC0002',
        updateDto,
      );
      expect(result).toEqual(expected);
    });
  });
});
