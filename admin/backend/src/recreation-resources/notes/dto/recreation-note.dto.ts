import { ApiProperty } from '@nestjs/swagger';

export class RecreationNoteDto {
  @ApiProperty({
    description: 'Unique identifier for the note',
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
  })
  note_id: string;

  @ApiProperty({
    description: 'Recreation Resource ID this note belongs to',
    example: 'REC0019',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Kind of note. Only NOTE is currently reachable',
    example: 'NOTE',
  })
  note_type_code: string;

  @ApiProperty({
    description: 'Short title shown at the top of the note card',
    example: 'Access road washout after spring melt',
  })
  title: string;

  @ApiProperty({
    description: 'Note body as sanitised HTML',
    example: '<p>The last 2km of the access road washed out.</p>',
  })
  body: string;

  @ApiProperty({
    description:
      'Date the note was logged. For imported notes this is the FTA entry date',
    example: '2026-04-18',
  })
  date_logged: string;

  @ApiProperty({
    description: 'Identity of the user who created the note',
    example: 'IDIR\\SJOHNSON',
    type: String,
    nullable: true,
  })
  created_by: string | null;

  @ApiProperty({
    description:
      'False for notes imported from FTA, which are locked from editing and deletion',
    example: true,
  })
  is_editable: boolean;
}
