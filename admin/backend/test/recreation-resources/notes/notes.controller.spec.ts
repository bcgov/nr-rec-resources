import { NotesController } from '@/recreation-resources/notes/notes.controller';
import { NotesService } from '@/recreation-resources/notes/notes.service';
import { RecreationNoteDto } from '@/recreation-resources/notes/dto/recreation-note.dto';
import {
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('NotesController', () => {
  let controller: NotesController;
  let service: NotesService;
  let module: TestingModule;

  const mockNotesService = {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: mockNotesService,
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
    service = module.get<NotesService>(NotesService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  const REC_RESOURCE_ID = 'REC0019';
  const NOTE_ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

  const mockNote: RecreationNoteDto = {
    note_id: NOTE_ID,
    rec_resource_id: REC_RESOURCE_ID,
    note_type_code: 'NOTE',
    title: 'Access road washout',
    body: '<p>The last 2km washed out.</p>',
    date_logged: '2026-05-14',
    created_by: 'IDIR\\jdoe',
    is_editable: true,
  };

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('passes the rec_resource_id through and returns the notes', async () => {
      mockNotesService.getAll.mockResolvedValue([mockNote]);

      const result = await controller.getAll(REC_RESOURCE_ID);

      expect(service.getAll).toHaveBeenCalledWith(REC_RESOURCE_ID);
      expect(result).toEqual([mockNote]);
    });
  });

  describe('create', () => {
    const dto = {
      title: 'Access road washout',
      body: '<p>The last 2km washed out.</p>',
    };

    it('passes the params through and returns the created note', async () => {
      mockNotesService.create.mockResolvedValue(mockNote);

      const result = await controller.create(REC_RESOURCE_ID, dto);

      expect(service.create).toHaveBeenCalledWith(REC_RESOURCE_ID, dto);
      expect(result).toEqual(mockNote);
    });

    it('rethrows an HttpException from the service untouched', async () => {
      mockNotesService.create.mockRejectedValue(new NotFoundException('gone'));

      await expect(controller.create(REC_RESOURCE_ID, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('wraps an unexpected error as a 500', async () => {
      mockNotesService.create.mockRejectedValue(new Error('db down'));

      await expect(controller.create(REC_RESOURCE_ID, dto)).rejects.toThrow(
        new HttpException('Error creating note', 500),
      );
    });
  });

  describe('update', () => {
    const dto = { title: 'New title' };

    it('passes the params through and returns the updated note', async () => {
      mockNotesService.update.mockResolvedValue(mockNote);

      const result = await controller.update(REC_RESOURCE_ID, NOTE_ID, dto);

      expect(service.update).toHaveBeenCalledWith(
        REC_RESOURCE_ID,
        NOTE_ID,
        dto,
      );
      expect(result).toEqual(mockNote);
    });

    it('rethrows an HttpException from the service untouched', async () => {
      mockNotesService.update.mockRejectedValue(
        new ForbiddenException('read only'),
      );

      await expect(
        controller.update(REC_RESOURCE_ID, NOTE_ID, dto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('wraps an unexpected error as a 500', async () => {
      mockNotesService.update.mockRejectedValue(new Error('db down'));

      await expect(
        controller.update(REC_RESOURCE_ID, NOTE_ID, dto),
      ).rejects.toThrow(new HttpException('Error updating note', 500));
    });
  });

  describe('delete', () => {
    it('passes the params through and returns the deleted note', async () => {
      mockNotesService.delete.mockResolvedValue(mockNote);

      const result = await controller.delete(REC_RESOURCE_ID, NOTE_ID);

      expect(service.delete).toHaveBeenCalledWith(REC_RESOURCE_ID, NOTE_ID);
      expect(result).toEqual(mockNote);
    });

    it('rethrows an HttpException from the service untouched', async () => {
      mockNotesService.delete.mockRejectedValue(
        new ForbiddenException('read only'),
      );

      await expect(controller.delete(REC_RESOURCE_ID, NOTE_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('wraps an unexpected error as a 500', async () => {
      mockNotesService.delete.mockRejectedValue(new Error('db down'));

      await expect(controller.delete(REC_RESOURCE_ID, NOTE_ID)).rejects.toThrow(
        new HttpException('Error deleting note', 500),
      );
    });
  });
});
