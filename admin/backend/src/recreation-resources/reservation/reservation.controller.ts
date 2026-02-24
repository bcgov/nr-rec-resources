import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import {
  Controller,
  Get,
  Put,
  Body,
  HttpException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { RecreationResourceReservationInfoDto } from './dto/recreation-resource-reservation.dto';
import { UpdateRecreationResourceReservationDto } from './dto/update-recreation-resource-reservation.dto';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/reservation',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get()
  @ApiOperation({
    operationId: 'getRecreationResourceReservation',
    summary: 'Get reservation data for a recreation resource',
    description: 'Returns reservation data for a recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC262200',
  })
  @ApiResponse({
    status: 200,
    description: 'Reservation data for the recreation resource',
    type: RecreationResourceReservationInfoDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation data not found',
  })
  async getReservationInfo(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationResourceReservationInfoDto> {
    const reservationData =
      await this.reservationService.findReservationDataById(rec_resource_id);

    if (!reservationData) {
      throw new HttpException(
        'Reservation data not found for this recreation resource.',
        404,
      );
    }

    return reservationData;
  }

  @Put()
  @ApiOperation({
    operationId: 'updateRecreationResourceReservation',
    summary: 'Update reservation data for a recreation resource',
    description:
      'Updates or inserts reservation data for a recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC262200',
  })
  @ApiBody({ type: UpdateRecreationResourceReservationDto })
  @ApiOkResponse({
    description: 'Updated reservation data for the recreation resource',
    type: UpdateRecreationResourceReservationDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors or invalid input',
  })
  async updateReservationData(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() updateDto: UpdateRecreationResourceReservationDto,
  ): Promise<UpdateRecreationResourceReservationDto> {
    await this.reservationService.updateReservationData(
      rec_resource_id,
      updateDto,
    );

    return updateDto;
  }
}
