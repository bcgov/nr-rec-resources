import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { trail_types } from '@generated/prisma';
import { RecreationTrailDto, TrailType } from './dto/recreation-trail.dto';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';

@Injectable()
export class TrailsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByResourceId(
    rec_resource_id: string,
  ): Promise<RecreationTrailDto[]> {
    const trails = await this.prisma.recreation_activity_code_trails.findMany({
      where: { rec_resource_id },
      select: {
        recreation_activity_code_trails_id: true,
        recreation_activity_code: true,
        trail_type: true,
        name: true,
        description: true,
      },
      orderBy: [{ recreation_activity_code: 'asc' }, { name: 'asc' }],
    });

    return trails.map((t) => ({
      recreation_activity_code_trails_id: t.recreation_activity_code_trails_id,
      recreation_activity_code: t.recreation_activity_code,
      trail_type: (t.trail_type as TrailType) ?? null,
      name: t.name,
      description: t.description ?? undefined,
    }));
  }

  async create(
    rec_resource_id: string,
    dto: CreateTrailDto,
  ): Promise<RecreationTrailDto> {
    const trail = await this.prisma.recreation_activity_code_trails.create({
      data: {
        rec_resource_id,
        recreation_activity_code: dto.recreation_activity_code,
        trail_type: (dto.trail_type as trail_types) ?? null,
        name: dto.name,
        description: dto.description ?? null,
      },
    });

    return {
      recreation_activity_code_trails_id:
        trail.recreation_activity_code_trails_id,
      recreation_activity_code: trail.recreation_activity_code,
      trail_type: (trail.trail_type as TrailType) ?? null,
      name: trail.name,
      description: trail.description ?? undefined,
    };
  }

  async update(
    trail_id: number,
    dto: UpdateTrailDto,
  ): Promise<RecreationTrailDto> {
    const trail = await this.prisma.recreation_activity_code_trails.update({
      where: { recreation_activity_code_trails_id: trail_id },
      data: {
        ...(dto.trail_type !== undefined && {
          trail_type: (dto.trail_type as trail_types) ?? null,
        }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });

    return {
      recreation_activity_code_trails_id:
        trail.recreation_activity_code_trails_id,
      recreation_activity_code: trail.recreation_activity_code,
      trail_type: (trail.trail_type as TrailType) ?? null,
      name: trail.name,
      description: trail.description ?? undefined,
    };
  }

  async delete(trail_id: number): Promise<void> {
    await this.prisma.recreation_activity_code_trails.delete({
      where: { recreation_activity_code_trails_id: trail_id },
    });
  }

  async findOne(trail_id: number): Promise<{
    recreation_activity_code_trails_id: number;
    rec_resource_id: string;
  } | null> {
    return this.prisma.recreation_activity_code_trails.findUnique({
      where: { recreation_activity_code_trails_id: trail_id },
      select: {
        recreation_activity_code_trails_id: true,
        rec_resource_id: true,
      },
    });
  }
}
