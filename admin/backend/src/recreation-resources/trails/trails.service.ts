import { PrismaService } from '@/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RecreationTrailDto } from './dto/recreation-trail.dto';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';
import { TrailsRepository } from './trails.repository';

@Injectable()
export class TrailsService {
  private readonly logger = new Logger(TrailsService.name);

  constructor(
    private readonly trailsRepository: TrailsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getAll(rec_resource_id: string): Promise<RecreationTrailDto[]> {
    this.logger.log(`Fetching trails for rec_resource_id: ${rec_resource_id}`);
    return this.trailsRepository.findAllByResourceId(rec_resource_id);
  }

  async create(
    rec_resource_id: string,
    dto: CreateTrailDto,
  ): Promise<RecreationTrailDto> {
    this.logger.log(
      `Creating trail for rec_resource_id: ${rec_resource_id}, activity_code: ${dto.recreation_activity_code}`,
    );

    await this.validateResourceExists(rec_resource_id);
    await this.validateAccessibleActivity(
      rec_resource_id,
      dto.recreation_activity_code,
    );

    return this.trailsRepository.create(rec_resource_id, dto);
  }

  async update(
    rec_resource_id: string,
    trail_id: number,
    dto: UpdateTrailDto,
  ): Promise<RecreationTrailDto> {
    this.logger.log(
      `Updating trail ${trail_id} for rec_resource_id: ${rec_resource_id}`,
    );

    await this.validateTrailBelongsToResource(rec_resource_id, trail_id);

    return this.trailsRepository.update(trail_id, dto);
  }

  async delete(rec_resource_id: string, trail_id: number): Promise<void> {
    this.logger.log(
      `Deleting trail ${trail_id} for rec_resource_id: ${rec_resource_id}`,
    );

    await this.validateTrailBelongsToResource(rec_resource_id, trail_id);

    await this.trailsRepository.delete(trail_id);
  }

  private async validateResourceExists(rec_resource_id: string): Promise<void> {
    const resource = await this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
      select: { rec_resource_id: true },
    });

    if (!resource) {
      throw new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
    }
  }

  private async validateAccessibleActivity(
    rec_resource_id: string,
    recreation_activity_code: number,
  ): Promise<void> {
    const activityCode = await this.prisma.recreation_activity_code.findUnique({
      where: { recreation_activity_code },
      select: { is_accessible: true },
    });

    if (!activityCode?.is_accessible) {
      throw new BadRequestException(
        `Activity code ${recreation_activity_code} is not an accessible activity`,
      );
    }

    const assignment = await this.prisma.recreation_activity.findUnique({
      where: {
        rec_resource_id_recreation_activity_code: {
          rec_resource_id,
          recreation_activity_code,
        },
      },
      select: { rec_resource_id: true },
    });

    if (!assignment) {
      throw new BadRequestException(
        `Activity code ${recreation_activity_code} is not assigned to resource ${rec_resource_id}`,
      );
    }
  }

  private async validateTrailBelongsToResource(
    rec_resource_id: string,
    trail_id: number,
  ): Promise<void> {
    const trail = await this.trailsRepository.findOne(trail_id);

    if (trail?.rec_resource_id !== rec_resource_id) {
      throw new NotFoundException(
        `Trail with ID ${trail_id} not found for recreation resource ${rec_resource_id}`,
      );
    }
  }
}
