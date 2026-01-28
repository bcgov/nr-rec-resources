import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Logger } from '@nestjs/common';
import { ReservationService } from '@/recreation-resources/reservation/reservation.service';
import { PrismaService } from '@/prisma.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let prisma: {
    recreation_resource_reservation_info: {
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      recreation_resource_reservation_info: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
      },
    };

    service = new ReservationService(prisma as unknown as PrismaService);

    // Silence and spy on logger
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  describe('findReservationDataById', () => {
    it('returns mapped reservation data when record exists', async () => {
      prisma.recreation_resource_reservation_info.findUnique.mockResolvedValue({
        rec_resource_id: 'REC123',
        reservation_website: 'https://example.com',
        reservation_phone_number: null,
        reservation_email: 'test@example.com',
      });

      const result = await service.findReservationDataById('REC123');

      expect(result).toEqual({
        rec_resource_id: 'REC123',
        reservation_website: 'https://example.com',
        reservation_phone_number: undefined,
        reservation_email: 'test@example.com',
      });

      expect(
        prisma.recreation_resource_reservation_info.findUnique,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC123' },
        select: {
          rec_resource_id: true,
          reservation_website: true,
          reservation_phone_number: true,
          reservation_email: true,
        },
      });

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Fetching reservation data for rec_resource_id: REC123',
      );
    });

    it('returns null when no record is found', async () => {
      prisma.recreation_resource_reservation_info.findUnique.mockResolvedValue(
        null,
      );

      const result = await service.findReservationDataById('REC404');

      expect(result).toBeNull();

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Fetching reservation data for rec_resource_id: REC404',
      );
    });
  });

  describe('updateReservationData', () => {
    it('upserts reservation data with defined values', async () => {
      prisma.recreation_resource_reservation_info.upsert.mockResolvedValue(
        undefined,
      );

      await service.updateReservationData('REC789', {
        reservation_website: 'https://site.com',
        reservation_phone_number: '123456',
        reservation_email: 'email@site.com',
      });

      expect(
        prisma.recreation_resource_reservation_info.upsert,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC789' },
        update: {
          reservation_website: 'https://site.com',
          reservation_phone_number: '123456',
          reservation_email: 'email@site.com',
        },
        create: {
          rec_resource_id: 'REC789',
          reservation_website: 'https://site.com',
          reservation_phone_number: '123456',
          reservation_email: 'email@site.com',
        },
      });

      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Updating reservation data for rec_resource_id: REC789',
      );
    });

    it('writes null when update DTO fields are undefined', async () => {
      prisma.recreation_resource_reservation_info.upsert.mockResolvedValue(
        undefined,
      );

      await service.updateReservationData('REC999', {});

      expect(
        prisma.recreation_resource_reservation_info.upsert,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC999' },
        update: {
          reservation_website: null,
          reservation_phone_number: null,
          reservation_email: null,
        },
        create: {
          rec_resource_id: 'REC999',
          reservation_website: null,
          reservation_phone_number: null,
          reservation_email: null,
        },
      });
    });
  });
});
