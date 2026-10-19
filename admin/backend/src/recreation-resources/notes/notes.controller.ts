import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRecreationNoteDto } from './dto/create-recreation-note.dto';
import { RecreationNoteDto } from './dto/recreation-note.dto';
import { UpdateRecreationNoteDto } from './dto/update-recreation-note.dto';
import { NotesService } from './notes.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/notes',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles(
  [
    RecreationResourceAuthRole.RST_ADMIN,
    RecreationResourceAuthRole.RST_SUPER_ADMIN,
  ],
  ROLE_MODE.ANY,
)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_IDIR_VIEWER,
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
      RecreationResourceAuthRole.RST_SUPER_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @ApiOperation({
    operationId: 'getRecreationResourceNotes',
    summary: 'Get all notes for a recreation resource',
    description:
      'Returns the notes and references for the recreation resource, newest first',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0019',
  })
  @ApiResponse({
    status: 200,
    description: 'List of notes for the recreation resource',
    type: [RecreationNoteDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationNoteDto[]> {
    return this.notesService.getAll(rec_resource_id);
  }

  @Post()
  @ApiOperation({
    operationId: 'createRecreationResourceNote',
    summary: 'Create a note for a recreation resource',
    description:
      'Creates a staff-authored note and associates it with the recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0019',
  })
  @ApiBody({
    required: true,
    description: 'Note data to create',
    type: CreateRecreationNoteDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Note created successfully',
    type: RecreationNoteDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation resource not found',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async create(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() createNoteDto: CreateRecreationNoteDto,
  ): Promise<RecreationNoteDto> {
    try {
      return await this.notesService.create(rec_resource_id, createNoteDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error creating note', 500);
    }
  }

  @Put(':note_id')
  @ApiOperation({
    operationId: 'updateRecreationResourceNote',
    summary: 'Update a note for a recreation resource',
    description:
      'Updates a staff-authored note. Notes imported from FTA are read-only, and only the note author or a super admin may change one',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0019',
  })
  @ApiParam({
    name: 'note_id',
    description: 'Note ID',
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
  })
  @ApiBody({
    required: true,
    description: 'Note fields to update',
    type: UpdateRecreationNoteDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfully',
    type: RecreationNoteDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Note was imported from FTA, or belongs to another staff member and the caller is not a super admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found for this recreation resource',
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async update(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('note_id', ParseUUIDPipe) note_id: string,
    @Body() updateNoteDto: UpdateRecreationNoteDto,
  ): Promise<RecreationNoteDto> {
    try {
      return await this.notesService.update(
        rec_resource_id,
        note_id,
        updateNoteDto,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error updating note', 500);
    }
  }

  @Delete(':note_id')
  @ApiOperation({
    operationId: 'deleteRecreationResourceNote',
    summary: 'Delete a note for a recreation resource',
    description:
      'Removes a staff-authored note. The previous row is retained in the note history table. Notes imported from FTA cannot be removed, and only the note author or a super admin may remove one',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0019',
  })
  @ApiParam({
    name: 'note_id',
    description: 'Note ID',
    example: '0f8fad5b-d9cb-469f-a165-70867728950e',
  })
  @ApiResponse({
    status: 200,
    description: 'Note deleted successfully',
    type: RecreationNoteDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Note was imported from FTA, or belongs to another staff member and the caller is not a super admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Note not found for this recreation resource',
  })
  async delete(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('note_id', ParseUUIDPipe) note_id: string,
  ): Promise<RecreationNoteDto> {
    try {
      return await this.notesService.delete(rec_resource_id, note_id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error deleting note', 500);
    }
  }
}
