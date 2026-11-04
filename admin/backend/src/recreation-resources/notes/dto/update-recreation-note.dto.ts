import { PartialType } from '@nestjs/swagger';
import { CreateRecreationNoteDto } from './create-recreation-note.dto';

export class UpdateRecreationNoteDto extends PartialType(
  CreateRecreationNoteDto,
) {}
