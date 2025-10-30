import { ApiProperty } from '@nestjs/swagger';
import { Length, Matches } from 'class-validator';

/**
 * DTO for recreation resource suggestions query parameters.
 *
 * Ensures that the searchTerm is alphanumeric and at least 3 characters long.
 */
export class SuggestionsQueryDto {
  /**
   * Alphanumeric search term (min 3 characters) used to search by name or ID.
   */
  @ApiProperty({
    description: 'Search term used to search by name or ID.',
    minLength: 3,
    maxLength: 50,
    type: String,
    example: 'Tamihi All',
    pattern: '^[A-Za-z0-9 "\'()#.&/]+$',
  })
  @Matches(/^[A-Za-z0-9 "'()#.&/]+$/, {
    message: 'search_term can only contain alphanumeric characters and spaces',
  })
  @Length(3, 50)
  search_term: string;
}
