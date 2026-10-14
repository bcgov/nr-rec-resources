import { PrismaService } from '@/prisma.service';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecreationNoteDto } from '@/recreation-resources/notes/dto/create-recreation-note.dto';
import { RecreationNoteDto } from '@/recreation-resources/notes/dto/recreation-note.dto';
import { UpdateRecreationNoteDto } from '@/recreation-resources/notes/dto/update-recreation-note.dto';
import {
  DEFAULT_NOTE_TYPE_CODE,
  NOTE_SOURCE_FTA,
  NOTE_SOURCE_RST,
} from '@/recreation-resources/notes/notes.constants';

type NoteRecord = {
  note_id: string;
  rec_resource_id: string;
  note_type_code: string;
  title: string;
  body: string;
  date_logged: Date;
  source_system: string;
  created_by: string | null;
};

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(NotesService.name);

  private static readonly SELECT = {
    note_id: true,
    rec_resource_id: true,
    note_type_code: true,
    title: true,
    body: true,
    date_logged: true,
    source_system: true,
    created_by: true,
  };

  private toDto(note: NoteRecord): RecreationNoteDto {
    return {
      note_id: note.note_id,
      rec_resource_id: note.rec_resource_id,
      note_type_code: note.note_type_code,
      title: note.title,
      body: note.body,
      // date only, so the client never has to reason about a timezone
      date_logged: note.date_logged.toISOString().slice(0, 10),
      created_by: note.created_by,
      is_editable: note.source_system !== NOTE_SOURCE_FTA,
    };
  }

  /**
   * Loads a note and asserts it belongs to the resource and can be changed.
   * Notes imported from FTA are historical records and stay read-only.
   */
  private async getEditableNote(
    rec_resource_id: string,
    note_id: string,
  ): Promise<NoteRecord> {
    const note = (await this.prisma.recreation_resource_note.findUnique({
      where: { note_id },
      select: NotesService.SELECT,
    } as any)) as NoteRecord | null;

    if (!note || note.rec_resource_id !== rec_resource_id) {
      throw new NotFoundException(
        `Note with ID ${note_id} not found for recreation resource ${rec_resource_id}`,
      );
    }

    if (note.source_system === NOTE_SOURCE_FTA) {
      throw new ForbiddenException(
        'Notes imported from FTA are historical records and cannot be changed or removed',
      );
    }

    return note;
  }

  /**
   * Get all notes for a recreation resource, newest first.
   */
  async getAll(rec_resource_id: string): Promise<RecreationNoteDto[]> {
    this.logger.log(`Fetching notes for rec_resource_id: ${rec_resource_id}`);

    const notes = (await this.prisma.recreation_resource_note.findMany({
      where: { rec_resource_id } as any,
      select: NotesService.SELECT,
      orderBy: [{ date_logged: 'desc' }, { created_at: 'desc' }],
    } as any)) as NoteRecord[];

    return notes.map((note) => this.toDto(note));
  }

  /**
   * Create a staff-authored note. created_by and the timestamps are applied by
   * the Prisma audit extension; date_logged defaults to today in the database.
   */
  async create(
    rec_resource_id: string,
    dto: CreateRecreationNoteDto,
  ): Promise<RecreationNoteDto> {
    const note = (await this.prisma.recreation_resource_note.create({
      data: {
        rec_resource_id,
        note_type_code: DEFAULT_NOTE_TYPE_CODE,
        title: dto.title,
        body: dto.body,
        source_system: NOTE_SOURCE_RST,
      },
      select: NotesService.SELECT,
    } as any)) as NoteRecord;

    this.logger.log(`Created note ${note.note_id} for ${rec_resource_id}`);

    return this.toDto(note);
  }

  async update(
    rec_resource_id: string,
    note_id: string,
    dto: UpdateRecreationNoteDto,
  ): Promise<RecreationNoteDto> {
    await this.getEditableNote(rec_resource_id, note_id);

    const note = (await this.prisma.recreation_resource_note.update({
      where: { note_id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.body !== undefined && { body: dto.body }),
      },
      select: NotesService.SELECT,
    } as any)) as NoteRecord;

    return this.toDto(note);
  }

  /**
   * Hard delete. The versioning trigger on the table writes the removed row to
   * recreation_resource_note_history, so the audit trail is kept there rather
   * than behind a soft-delete flag.
   */
  async delete(
    rec_resource_id: string,
    note_id: string,
  ): Promise<RecreationNoteDto> {
    await this.getEditableNote(rec_resource_id, note_id);

    const note = (await this.prisma.recreation_resource_note.delete({
      where: { note_id },
      select: NotesService.SELECT,
    } as any)) as NoteRecord;

    this.logger.log(`Deleted note ${note_id} for ${rec_resource_id}`);

    return this.toDto(note);
  }
}
