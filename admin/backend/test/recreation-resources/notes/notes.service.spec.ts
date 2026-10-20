import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { PrismaService } from '@/prisma.service';
import { NotesService } from '@/recreation-resources/notes/notes.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('NotesService', () => {
  let service: NotesService;
  let module: TestingModule;

  const mockPrismaService = {
    recreation_resource_note: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const AUTHOR = 'IDIR\\jdoe';
  const OTHER = 'IDIR\\someone-else';

  const mockUserContext = {
    getIdentityProviderPrefixedUsername: vi.fn(),
    getCurrentUser: vi.fn(),
  };

  const signInAs = (username: string, roles: string[] = ['rst-admin']) => {
    mockUserContext.getIdentityProviderPrefixedUsername.mockReturnValue(
      username,
    );
    mockUserContext.getCurrentUser.mockReturnValue({ client_roles: roles });
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UserContextService,
          useValue: mockUserContext,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    signInAs(AUTHOR);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  const REC_RESOURCE_ID = 'REC0019';
  const NOTE_ID = '0f8fad5b-d9cb-469f-a165-70867728950e';

  const makeDbRow = (overrides: Record<string, unknown> = {}) => ({
    note_id: NOTE_ID,
    rec_resource_id: REC_RESOURCE_ID,
    note_type_code: 'NOTE',
    title: 'Access road washout',
    body: '<p>The last 2km washed out.</p>',
    date_logged: new Date('2026-05-14T00:00:00Z'),
    source_system: 'RST',
    created_by: 'IDIR\\jdoe',
    ...overrides,
  });

  describe('getAll', () => {
    it('maps rows to DTOs', async () => {
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([
        makeDbRow(),
      ]);

      const result = await service.getAll(REC_RESOURCE_ID);

      expect(result).toEqual([
        {
          note_id: NOTE_ID,
          rec_resource_id: REC_RESOURCE_ID,
          note_type_code: 'NOTE',
          title: 'Access road washout',
          body: '<p>The last 2km washed out.</p>',
          date_logged: '2026-05-14',
          created_by: 'IDIR\\jdoe',
          is_editable: true,
        },
      ]);
    });

    it('filters by rec_resource_id, newest first', async () => {
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([]);

      await service.getAll(REC_RESOURCE_ID);

      expect(
        mockPrismaService.recreation_resource_note.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { rec_resource_id: REC_RESOURCE_ID },
          orderBy: [{ date_logged: 'desc' }, { created_at: 'desc' }],
        }),
      );
    });

    it('returns an empty array when there are no notes', async () => {
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([]);

      await expect(service.getAll(REC_RESOURCE_ID)).resolves.toEqual([]);
    });

    it('marks FTA notes as not editable', async () => {
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([
        makeDbRow({ source_system: 'FTA' }),
      ]);

      const [note] = await service.getAll(REC_RESOURCE_ID);

      expect(note.is_editable).toBe(false);
    });

    it('reduces date_logged to a date, dropping the time', async () => {
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([
        makeDbRow({ date_logged: new Date('2026-12-31T23:00:00Z') }),
      ]);

      const [note] = await service.getAll(REC_RESOURCE_ID);

      expect(note.date_logged).toBe('2026-12-31');
    });
  });

  describe('create', () => {
    it('writes the note as RST-sourced with the default type', async () => {
      mockPrismaService.recreation_resource_note.create.mockResolvedValue(
        makeDbRow(),
      );

      await service.create(REC_RESOURCE_ID, {
        title: 'Access road washout',
        body: '<p>The last 2km washed out.</p>',
      });

      expect(
        mockPrismaService.recreation_resource_note.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            rec_resource_id: REC_RESOURCE_ID,
            note_type_code: 'NOTE',
            title: 'Access road washout',
            body: '<p>The last 2km washed out.</p>',
            source_system: 'RST',
          },
        }),
      );
    });

    it('returns the created note as a DTO', async () => {
      mockPrismaService.recreation_resource_note.create.mockResolvedValue(
        makeDbRow(),
      );

      const result = await service.create(REC_RESOURCE_ID, {
        title: 'Access road washout',
        body: '<p>The last 2km washed out.</p>',
      });

      expect(result.note_id).toBe(NOTE_ID);
      expect(result.is_editable).toBe(true);
    });
  });

  describe('update', () => {
    it('updates only the fields provided', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow(),
      );
      mockPrismaService.recreation_resource_note.update.mockResolvedValue(
        makeDbRow({ title: 'New title' }),
      );

      await service.update(REC_RESOURCE_ID, NOTE_ID, { title: 'New title' });

      expect(
        mockPrismaService.recreation_resource_note.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { note_id: NOTE_ID },
          data: { title: 'New title' },
        }),
      );
    });

    it('sends no fields when the dto is empty', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow(),
      );
      mockPrismaService.recreation_resource_note.update.mockResolvedValue(
        makeDbRow(),
      );

      await service.update(REC_RESOURCE_ID, NOTE_ID, {});

      expect(
        mockPrismaService.recreation_resource_note.update,
      ).toHaveBeenCalledWith(expect.objectContaining({ data: {} }));
    });

    it('updates both fields when both are provided', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow(),
      );
      mockPrismaService.recreation_resource_note.update.mockResolvedValue(
        makeDbRow(),
      );

      await service.update(REC_RESOURCE_ID, NOTE_ID, {
        title: 'New title',
        body: '<p>New body</p>',
      });

      expect(
        mockPrismaService.recreation_resource_note.update,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { title: 'New title', body: '<p>New body</p>' },
        }),
      );
    });

    it('throws NotFoundException when the note does not exist', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        null,
      );

      await expect(
        service.update(REC_RESOURCE_ID, NOTE_ID, { title: 'New title' }),
      ).rejects.toThrow(NotFoundException);
      expect(
        mockPrismaService.recreation_resource_note.update,
      ).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the note belongs to another resource', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow({ rec_resource_id: 'REC9999' }),
      );

      await expect(
        service.update(REC_RESOURCE_ID, NOTE_ID, { title: 'New title' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException for an FTA note', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow({ source_system: 'FTA' }),
      );

      await expect(
        service.update(REC_RESOURCE_ID, NOTE_ID, { title: 'New title' }),
      ).rejects.toThrow(ForbiddenException);
      expect(
        mockPrismaService.recreation_resource_note.update,
      ).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the note and returns it', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow(),
      );
      mockPrismaService.recreation_resource_note.delete.mockResolvedValue(
        makeDbRow(),
      );

      const result = await service.delete(REC_RESOURCE_ID, NOTE_ID);

      expect(
        mockPrismaService.recreation_resource_note.delete,
      ).toHaveBeenCalledWith(
        expect.objectContaining({ where: { note_id: NOTE_ID } }),
      );
      expect(result.note_id).toBe(NOTE_ID);
    });

    it('throws NotFoundException when the note does not exist', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        null,
      );

      await expect(service.delete(REC_RESOURCE_ID, NOTE_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(
        mockPrismaService.recreation_resource_note.delete,
      ).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException for an FTA note', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow({ source_system: 'FTA' }),
      );

      await expect(service.delete(REC_RESOURCE_ID, NOTE_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(
        mockPrismaService.recreation_resource_note.delete,
      ).not.toHaveBeenCalled();
    });
  });
  describe('ownership', () => {
    const otherUsersNote = () => makeDbRow({ created_by: OTHER });

    it("marks another staff member's note as not editable", async () => {
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([
        otherUsersNote(),
      ]);

      const [note] = await service.getAll(REC_RESOURCE_ID);

      expect(note.is_editable).toBe(false);
    });

    it('marks every note editable for a super admin', async () => {
      signInAs(AUTHOR, ['rst-super-admin']);
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([
        otherUsersNote(),
      ]);

      const [note] = await service.getAll(REC_RESOURCE_ID);

      expect(note.is_editable).toBe(true);
    });

    it('keeps FTA notes locked even for a super admin', async () => {
      signInAs(AUTHOR, ['rst-super-admin']);
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([
        makeDbRow({ source_system: 'FTA', created_by: AUTHOR }),
      ]);

      const [note] = await service.getAll(REC_RESOURCE_ID);

      expect(note.is_editable).toBe(false);
    });

    it('tolerates a token with no roles', async () => {
      mockUserContext.getCurrentUser.mockReturnValue({});
      mockPrismaService.recreation_resource_note.findMany.mockResolvedValue([
        otherUsersNote(),
      ]);

      const [note] = await service.getAll(REC_RESOURCE_ID);

      expect(note.is_editable).toBe(false);
    });

    it("refuses to update another staff member's note", async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        otherUsersNote(),
      );

      await expect(
        service.update(REC_RESOURCE_ID, NOTE_ID, { title: 'New title' }),
      ).rejects.toThrow(ForbiddenException);
      expect(
        mockPrismaService.recreation_resource_note.update,
      ).not.toHaveBeenCalled();
    });

    it("refuses to delete another staff member's note", async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        otherUsersNote(),
      );

      await expect(service.delete(REC_RESOURCE_ID, NOTE_ID)).rejects.toThrow(
        ForbiddenException,
      );
      expect(
        mockPrismaService.recreation_resource_note.delete,
      ).not.toHaveBeenCalled();
    });

    it("lets a super admin update another staff member's note", async () => {
      signInAs(AUTHOR, ['rst-super-admin']);
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        otherUsersNote(),
      );
      mockPrismaService.recreation_resource_note.update.mockResolvedValue(
        makeDbRow({ created_by: OTHER, title: 'New title' }),
      );

      await service.update(REC_RESOURCE_ID, NOTE_ID, { title: 'New title' });

      expect(
        mockPrismaService.recreation_resource_note.update,
      ).toHaveBeenCalled();
    });

    it("lets a super admin delete another staff member's note", async () => {
      signInAs(AUTHOR, ['rst-super-admin']);
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        otherUsersNote(),
      );
      mockPrismaService.recreation_resource_note.delete.mockResolvedValue(
        otherUsersNote(),
      );

      await service.delete(REC_RESOURCE_ID, NOTE_ID);

      expect(
        mockPrismaService.recreation_resource_note.delete,
      ).toHaveBeenCalled();
    });

    it('lets the author update their own note', async () => {
      mockPrismaService.recreation_resource_note.findUnique.mockResolvedValue(
        makeDbRow({ created_by: AUTHOR }),
      );
      mockPrismaService.recreation_resource_note.update.mockResolvedValue(
        makeDbRow({ created_by: AUTHOR }),
      );

      await service.update(REC_RESOURCE_ID, NOTE_ID, { title: 'New title' });

      expect(
        mockPrismaService.recreation_resource_note.update,
      ).toHaveBeenCalled();
    });
  });
});
