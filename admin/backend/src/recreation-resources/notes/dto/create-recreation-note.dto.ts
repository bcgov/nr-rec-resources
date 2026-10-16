import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';
import {
  NOTE_BODY_MAX_LENGTH,
  NOTE_TITLE_MAX_LENGTH,
} from '@/recreation-resources/notes/notes.constants';
import { IsHtmlTextLength } from '@/recreation-resources/notes/validators/is-html-text-length.validator';

export class CreateRecreationNoteDto {
  @ApiProperty({
    description: 'Short title shown at the top of the note card',
    example: 'Access road washout after spring melt',
    maxLength: NOTE_TITLE_MAX_LENGTH,
  })
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(NOTE_TITLE_MAX_LENGTH)
  title: string;

  @ApiProperty({
    description:
      'Note body as HTML. The length limit applies to the text content, not the markup',
    example: '<p>The last 2km of the access road washed out.</p>',
  })
  @IsString()
  @IsHtmlTextLength(1, NOTE_BODY_MAX_LENGTH)
  body: string;
}
