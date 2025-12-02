import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OptionDto {
  @ApiProperty({
    description: 'Unique identifier for the option',
    example: 'hiking',
  })
  id: string;

  @ApiProperty({
    description: 'Human-readable label for the option',
    example: 'Hiking',
  })
  label: string;

  @ApiPropertyOptional({
    description:
      'Child options for hierarchical data (e.g., sub-access codes for access codes)',
    type: [OptionDto],
    example: [
      { id: 'hiking_trail', label: 'Hiking Trail' },
      { id: 'hiking_backcountry', label: 'Backcountry Hiking' },
    ],
  })
  children?: OptionDto[];

  @ApiPropertyOptional({
    description: 'Indicates if the option is archived',
    example: false,
  })
  is_archived?: boolean;
}

export class CreateOptionDto {
  @ApiProperty({
    description: 'Human-readable label for the option',
    example: 'Backpacking',
  })
  @IsString()
  @IsNotEmpty()
  label: string;
}

export class UpdateOptionDto {
  @ApiProperty({
    description: 'Human-readable label for the option',
    example: 'Backpacking & Camping',
  })
  @IsString()
  @IsNotEmpty()
  label: string;
}

export class DeleteOptionResponseDto {
  @ApiProperty({
    description: 'Indicates if the deletion was successful',
    example: true,
  })
  success: boolean;
}
