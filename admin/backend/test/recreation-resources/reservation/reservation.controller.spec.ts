import { ReservationController } from '@/recreation-resources/reservation/reservation.controller';
import { ReservationService } from '@/recreation-resources/reservation/reservation.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ReservationController', () => {
  let controller: ReservationController;
  let reservationService: ReservationService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationController],
      providers: [
        {
          provide: ReservationService,
          useValue: {
            findReservationDataById: vi.fn(),
            updateReservationData: vi.fn(),
          },
        },
      ],
    }).compile();

    reservationService = module.get<ReservationService>(ReservationService);
    controller = module.get<ReservationController>(ReservationController);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findUnique', () => {
    it('should return reservation data', async () => {
      const result = {
        reservation_email: 'email@email.com',
        reservation_website: 'www.website.com',
        reservation_phone_number: '7789787786',
      };

      vi.spyOn(reservationService, 'findReservationDataById').mockResolvedValue(
        result as any,
      );

      const response = await controller.getReservationInfo('REC1222');

      expect(response).toBe(result);
      expect(reservationService.findReservationDataById).toHaveBeenCalledWith(
        'REC1222',
      );
    });

    it('should return null when no reservation data found', async () => {
      vi.spyOn(reservationService, 'findReservationDataById').mockResolvedValue(
        null,
      );

      const httpException = new HttpException(
        'Reservation data not found for this recreation resource.',
        404,
      );
      await expect(controller.getReservationInfo('REC9999')).rejects.toThrow(
        httpException,
      );

      expect(reservationService.findReservationDataById).toHaveBeenCalledWith(
        'REC9999',
      );
    });
  });

  describe('updateReservationData', () => {
    it('should create or update and return a reservation', async () => {
      const upsertReservationDto = {
        reservation_email: 'email@email.com',
        reservation_website: 'www.website.com',
        reservation_phone_number: '7789787786',
      };

      const expectedResult = {
        reservation_email: 'newmail@email.com',
      };

      vi.spyOn(reservationService, 'updateReservationData').mockResolvedValue(
        expectedResult as any,
      );

      const response = await controller.updateReservationData(
        'REC1222',
        upsertReservationDto as any,
      );

      expect(response).toBe(upsertReservationDto);
      expect(reservationService.updateReservationData).toHaveBeenCalledWith(
        'REC1222',
        upsertReservationDto,
      );
    });

    it('should re-throw HttpException as-is', async () => {
      const upsertReservationDto = {
        reservation_email: 'email@email.com',
        reservation_website: 'www.website.com',
        reservation_phone_number: '7789787786',
      };

      const httpException = new HttpException('Not Found', 404);
      vi.spyOn(reservationService, 'updateReservationData').mockRejectedValue(
        httpException,
      );

      await expect(
        controller.updateReservationData(
          'REC1222',
          upsertReservationDto as any,
        ),
      ).rejects.toThrow(httpException);
    });

    it('should wrap generic errors in 500 HttpException', async () => {
      const upsertReservationDto = {
        reservation_email: 'email@email.com',
        reservation_website: 'www.website.com',
        reservation_phone_number: '7789787786',
      };

      const genericError = new Error('Database error');
      vi.spyOn(reservationService, 'updateReservationData').mockRejectedValue(
        genericError,
      );

      await expect(
        controller.updateReservationData(
          'REC1222',
          upsertReservationDto as any,
        ),
      ).rejects.toThrow(genericError);
    });
  });

  it('should re-throw HttpException as-is', async () => {
    const upsertReservationDto = {
      reservation_website: 'www.website.com',
    };

    const httpException = new HttpException('Not Found', 404);
    vi.spyOn(reservationService, 'updateReservationData').mockRejectedValue(
      httpException,
    );

    await expect(
      controller.updateReservationData('REC1222', upsertReservationDto as any),
    ).rejects.toThrow(httpException);
  });

  it('should wrap generic errors in 500 HttpException', async () => {
    const upsertReservationDto = {
      reservation_website: 'www.website.com',
    };

    const genericError = new Error('Database error');
    vi.spyOn(reservationService, 'updateReservationData').mockRejectedValue(
      genericError,
    );

    await expect(
      controller.updateReservationData('REC1222', upsertReservationDto as any),
    ).rejects.toThrow(genericError);
  });
});
