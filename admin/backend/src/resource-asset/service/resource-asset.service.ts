import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import {
  BulkAssetUpdateResponseDto,
  CreateRecreationAssetDto,
  CreateRecreationAssetRepairDto,
  FindAllAssetsQueryDto,
  PaginatedRecreationAssetDto,
  RecreationAssetBulkRepairDto,
  RecreationAssetBulkUpdateDto,
  RecreationAssetCodeDto,
  RecreationAssetDto,
  RecreationAssetRepairDto,
  RecreationRepairCodeDto,
  UpdateRecreationAssetDto,
  UpdateRecreationAssetRepairDto,
} from '../dto';
import { Prisma } from '@/generated/prisma/browser';
import { getRecreationAssetGeom } from '@prisma-generated-sql/getRecreationAssetGeom';

type AssetGeom = {
  latitude: number | null;
  longitude: number | null;
  geometry_type_code: string | null;
};

@Injectable()
export class RecreationAssetService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // RECREATION ASSET CODE (LOOKUP TABLE) LOGIC
  // =========================================================================

  async findAllAssetCodes(): Promise<RecreationAssetCodeDto[]> {
    const codes = await this.prisma.recreation_asset_code.findMany({
      orderBy: { asset_code: 'asc' },
    });
    return codes.map((c) => this.mapAssetCodeToDto(c));
  }

  async findAssetCodeById(assetCode: number): Promise<RecreationAssetCodeDto> {
    const code = await this.prisma.recreation_asset_code.findUnique({
      where: { asset_code: assetCode },
    });

    if (!code) {
      throw new NotFoundException(
        `Recreation asset code with ID ${assetCode} not found`,
      );
    }

    return this.mapAssetCodeToDto(code);
  }

  // =========================================================================
  // RECREATION REPAIR CODE (LOOKUP TABLE) LOGIC
  // =========================================================================

  async findAllRepairCodes(): Promise<RecreationRepairCodeDto[]> {
    const codes = await this.prisma.recreation_remed_repair_code.findMany({
      orderBy: { recreation_remed_repair_code: 'asc' },
    });
    return codes.map((c) => this.mapRepairCodeToDto(c));
  }

  // =========================================================================
  // RECREATION ASSET LOGIC
  // =========================================================================

  async createAsset(
    dto: CreateRecreationAssetDto,
  ): Promise<RecreationAssetDto> {
    const assetCode = await this.findAssetCodeById(dto.asset_code);
    const created = await this.prisma.recreation_asset.create({
      data: {
        parent_id: dto.parent_id ? BigInt(dto.parent_id) : null,
        asset_tag: dto.asset_tag ?? null,
        rec_resource_id: dto.rec_resource_id,
        asset_code: assetCode.asset_code,
        asset_name: dto.asset_name ?? null,
        asset_comment: dto.asset_comment ?? null,
        legacy_structure_id: dto.legacy_structure_id ?? null,
        asset_length: dto.asset_length ?? null,
        asset_width: dto.asset_width ?? null,
        asset_area: dto.asset_area ?? null,
        actual_value: dto.actual_value ?? null,
        default_value: dto.default_value ?? null,
        installation_date: dto.installation_date
          ? new Date(dto.installation_date)
          : null,
      },
    });

    if (dto.geometry_type_code && dto.latitude && dto.longitude) {
      await this.upsertAssetGeometry(
        Number(created.asset_id),
        dto.geometry_type_code,
        dto.latitude,
        dto.longitude,
      );
    }

    return this.mapAssetToDto(created);
  }

  async findAllAssets(
    query: FindAllAssetsQueryDto,
  ): Promise<PaginatedRecreationAssetDto> {
    const {
      page = 1,
      limit = 10,
      parent_id,
      asset_tag,
      rec_resource_id,
      asset_code,
      asset_name,
      legacy_structure_id,
      min_actual_value,
      max_actual_value,
      include_repair: includeRepair = false,
    } = query;

    // Build dynamic Prisma filter clause
    const where: Prisma.recreation_assetWhereInput = {};

    if (parent_id !== undefined) where.parent_id = parent_id;
    if (rec_resource_id) where.rec_resource_id = rec_resource_id;
    if (asset_code !== undefined) where.asset_code = asset_code;
    if (legacy_structure_id) where.legacy_structure_id = legacy_structure_id;

    // String case-insensitive partial match ("contains")
    if (asset_tag) {
      where.asset_tag = { contains: asset_tag, mode: 'insensitive' };
    }
    if (asset_name) {
      where.asset_name = { contains: asset_name, mode: 'insensitive' };
    }

    // Range filters
    if (min_actual_value !== undefined || max_actual_value !== undefined) {
      where.actual_value = {};
      if (min_actual_value !== undefined)
        where.actual_value.gte = min_actual_value;
      if (max_actual_value !== undefined)
        where.actual_value.lte = max_actual_value;
    }

    // Calculate pagination offsets
    const skip = (page - 1) * limit;

    // Execute data query and total count concurrently
    const [data, total] = await this.prisma.$transaction([
      this.prisma.recreation_asset.findMany({
        select: {
          asset_id: true,
          parent_id: true,
          asset_tag: true,
          rec_resource_id: true,
          asset_code: true,
          asset_name: true,
          asset_comment: true,
          legacy_structure_id: true,
          asset_length: true,
          asset_width: true,
          asset_area: true,
          actual_value: true,
          default_value: true,
          installation_date: true,
          updated_by: true,
          updated_at: true,
          recreation_asset_repair: includeRepair,
        },
        where,
        skip,
        take: limit,
        orderBy: { asset_id: 'desc' },
      }),
      this.prisma.recreation_asset.count({ where }),
    ]);

    const geomByAssetId = await this.fetchGeomByAssetIds(
      data.map((asset) => asset.asset_id),
    );

    return {
      data: data.map((asset) =>
        this.mapAssetToDto(
          asset,
          includeRepair,
          geomByAssetId.get(asset.asset_id.toString()),
        ),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAssetById(
    id: number,
    includeRepair: boolean = false,
  ): Promise<RecreationAssetDto> {
    const asset = await this.prisma.recreation_asset.findUnique({
      select: {
        asset_id: true,
        parent_id: true,
        asset_tag: true,
        rec_resource_id: true,
        asset_code: true,
        asset_name: true,
        asset_comment: true,
        legacy_structure_id: true,
        asset_length: true,
        asset_width: true,
        asset_area: true,
        actual_value: true,
        default_value: true,
        installation_date: true,
        updated_by: true,
        updated_at: true,
        recreation_asset_repair: includeRepair,
      },
      where: { asset_id: BigInt(id) },
    });

    if (!asset) {
      throw new NotFoundException(`Recreation asset with ID ${id} not found`);
    }

    const geomByAssetId = await this.fetchGeomByAssetIds([asset.asset_id]);
    const assetDto = this.mapAssetToDto(
      asset,
      includeRepair,
      geomByAssetId.get(asset.asset_id.toString()),
    );
    return assetDto;
  }

  async updateAsset(
    id: number,
    dto: UpdateRecreationAssetDto,
  ): Promise<RecreationAssetDto> {
    await this.ensureAssetExists(id);

    if (dto.rec_resource_id === null) {
      throw new BadRequestException('rec_resource_id cannot be null');
    }

    const data = this.buildUpdateData(dto);

    const updated = await this.prisma.recreation_asset.update({
      where: { asset_id: BigInt(id) },
      data,
    });

    if (dto.geometry_type_code && dto.latitude && dto.longitude) {
      await this.upsertAssetGeometry(
        Number(updated.asset_id),
        dto.geometry_type_code,
        dto.latitude,
        dto.longitude,
      );
    }

    return this.mapAssetToDto(updated);
  }

  private buildUpdateData(
    dto: UpdateRecreationAssetDto,
  ): Prisma.recreation_assetUpdateInput {
    const data: Prisma.recreation_assetUncheckedUpdateInput = {};

    if (dto.parent_id !== undefined) {
      data.parent_id = dto.parent_id ? BigInt(dto.parent_id) : null;
    }
    if (dto.installation_date !== undefined) {
      data.installation_date = dto.installation_date
        ? new Date(dto.installation_date)
        : null;
    }

    const simpleFields = [
      'asset_tag',
      'rec_resource_id',
      'asset_code',
      'asset_name',
      'asset_comment',
      'legacy_structure_id',
      'asset_length',
      'asset_width',
      'asset_area',
      'default_value',
      'actual_value',
    ] as const;

    for (const field of simpleFields) {
      if (dto[field] !== undefined) {
        (data as any)[field] = dto[field];
      }
    }

    return data;
  }

  async deleteAsset(id: number): Promise<void> {
    await this.ensureAssetExists(id);
    await this.prisma.recreation_asset.delete({
      where: { asset_id: BigInt(id) },
    });
  }

  async bulkUpdateAssets(
    dto: RecreationAssetBulkUpdateDto,
  ): Promise<BulkAssetUpdateResponseDto> {
    const { asset_ids, update_fields } = dto;

    // 1. Basic validation
    if (!asset_ids || asset_ids.length === 0) {
      throw new BadRequestException('At least one asset_id must be provided.');
    }

    if (update_fields.rec_resource_id === null) {
      throw new BadRequestException('rec_resource_id cannot be null');
    }

    const uniqueIds = Array.from(new Set(asset_ids));

    // 2. Ensure all specified assets exist
    await this.ensureAssetsExist(uniqueIds);

    // 3. Build data payload dynamically using a field transformation map
    const fieldTransformers: Record<string, (val: any) => any> = {
      parent_id: (val) => (val ? BigInt(val) : null),
      installation_date: (val) => (val ? new Date(val) : null),
    };

    const dataToUpdate: Prisma.recreation_assetUncheckedUpdateInput = {
      updated_at: new Date(),
    };

    for (const [key, value] of Object.entries(update_fields)) {
      if (value !== undefined) {
        const transform = fieldTransformers[key];
        dataToUpdate[key] = transform ? transform(value) : value;
      }
    }

    const result = await this.prisma.recreation_asset.updateMany({
      where: {
        asset_id: {
          in: uniqueIds.map(BigInt),
        },
      },
      data: dataToUpdate,
    });

    return {
      status: 'success',
      updated_count: result.count,
      updated_asset_ids: uniqueIds,
    };
  }

  // =========================================================================
  // RECREATION ASSET REPAIR LOGIC
  // =========================================================================

  async createRepair(
    dto: CreateRecreationAssetRepairDto,
  ): Promise<RecreationAssetRepairDto> {
    if (dto.asset_id === undefined) {
      throw new BadRequestException('asset_id is required');
    }
    await this.ensureAssetExists(dto.asset_id);

    const created = await this.prisma.recreation_asset_repair.create({
      data: {
        asset_id: BigInt(dto.asset_id),
        recreation_remed_repair_code: dto.recreation_remed_repair_code ?? null,
        estimated_repair_cost: dto.estimated_repair_cost ?? null,
        actual_repair_cost: dto.actual_repair_cost ?? null,
        repair_completed_date: dto.repair_completed_date
          ? new Date(dto.repair_completed_date)
          : null,
        urgency: dto.urgency ?? null,
        trail_segment_start: dto.trail_segment_start ?? null,
        trail_segment_end: dto.trail_segment_end ?? null,
      },
    });

    return this.mapRepairToDto(created);
  }

  async findRepairsByAssetId(
    assetId: number,
  ): Promise<RecreationAssetRepairDto[]> {
    await this.ensureAssetExists(assetId);

    const repairs = await this.prisma.recreation_asset_repair.findMany({
      where: { asset_id: BigInt(assetId) },
      orderBy: { repair_id: 'asc' },
    });

    return repairs.map((r) => this.mapRepairToDto(r));
  }

  async updateRepair(
    repairId: number,
    dto: UpdateRecreationAssetRepairDto,
  ): Promise<RecreationAssetRepairDto> {
    const existing = await this.prisma.recreation_asset_repair.findUnique({
      where: { repair_id: BigInt(repairId) },
    });

    if (!existing) {
      throw new NotFoundException(
        `Repair record with ID ${repairId} not found`,
      );
    }

    const updated = await this.prisma.recreation_asset_repair.update({
      where: { repair_id: BigInt(repairId) },
      data: {
        ...(dto.recreation_remed_repair_code !== undefined && {
          recreation_remed_repair_code: dto.recreation_remed_repair_code,
        }),
        ...(dto.estimated_repair_cost !== undefined && {
          estimated_repair_cost: dto.estimated_repair_cost,
        }),
        ...(dto.actual_repair_cost !== undefined && {
          actual_repair_cost: dto.actual_repair_cost,
        }),
        ...(dto.repair_completed_date !== undefined && {
          repair_completed_date: dto.repair_completed_date
            ? new Date(dto.repair_completed_date)
            : null,
        }),
        ...(dto.urgency !== undefined && { urgency: dto.urgency }),
        ...(dto.trail_segment_start !== undefined && {
          trail_segment_start: dto.trail_segment_start,
        }),
        ...(dto.trail_segment_end !== undefined && {
          trail_segment_end: dto.trail_segment_end,
        }),
      },
    });

    return this.mapRepairToDto(updated);
  }

  async deleteRepair(repairId: number): Promise<void> {
    const existing = await this.prisma.recreation_asset_repair.findUnique({
      where: { repair_id: BigInt(repairId) },
    });

    if (!existing) {
      throw new NotFoundException(
        `Repair record with ID ${repairId} not found`,
      );
    }

    await this.prisma.recreation_asset_repair.delete({
      where: { repair_id: BigInt(repairId) },
    });
  }

  async bulkInsertRepairs(dto: RecreationAssetBulkRepairDto): Promise<void> {
    const allAssetIds = Array.from(
      new Set(dto.changes.flatMap((change) => change.asset_ids)),
    );
    await this.ensureAssetsExist(allAssetIds);

    const completedDate = dto.completed_date
      ? new Date(dto.completed_date)
      : null;

    // Flatten nested changes into a single array of record objects
    const recordsToInsert = dto.changes.flatMap((change) =>
      change.asset_ids.map((assetId) => ({
        asset_id: BigInt(assetId),
        recreation_remed_repair_code: dto.recreation_remed_repair_code,
        estimated_repair_cost: change.estimated_repair_cost,
        actual_repair_cost: change.actual_repair_cost ?? null,
        repair_completed_date: completedDate,
        trail_segment_start: change.station_start ?? null,
        trail_segment_end: change.station_end ?? null,
      })),
    );

    if (recordsToInsert.length === 0) return;

    // Single bulk insert query replaces the previous transaction block
    await this.prisma.recreation_asset_repair.createMany({
      data: recordsToInsert,
    });
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  private async ensureAssetExists(assetId: number): Promise<void> {
    const asset = await this.prisma.recreation_asset.findUnique({
      where: { asset_id: BigInt(assetId) },
      select: { asset_id: true },
    });

    if (!asset) {
      throw new NotFoundException(
        `Recreation asset with ID ${assetId} not found`,
      );
    }
  }

  private async ensureAssetsExist(assetIds: number[]): Promise<void> {
    const existingCount = await this.prisma.recreation_asset.count({
      where: {
        asset_id: {
          in: assetIds.map(BigInt),
        },
      },
    });

    if (existingCount !== assetIds.length) {
      throw new NotFoundException(
        'One or more specified asset_ids do not exist in the database.',
      );
    }
  }

  private mapAssetCodeToDto(record: any): RecreationAssetCodeDto {
    return {
      asset_code: record.asset_code,
      description: record.description ?? null,
    };
  }

  private mapRepairCodeToDto(record: any): RecreationRepairCodeDto {
    return {
      recreation_remed_repair_code: record.recreation_remed_repair_code,
      description: record.description ?? null,
    };
  }

  /**
   * Batched lat/long lookup (BC Albers -> WGS84) for a set of asset ids, via the
   * getRecreationAssetGeom typed SQL query. Returns a map keyed by asset_id.toString()
   * so callers can look up by BigInt without a second conversion.
   */
  private async fetchGeomByAssetIds(
    assetIds: bigint[],
  ): Promise<Map<string, AssetGeom>> {
    if (assetIds.length === 0) {
      return new Map();
    }

    const rows = await this.prisma.$queryRawTyped(
      getRecreationAssetGeom(assetIds),
    );

    return new Map(
      rows.map((row) => [
        row.asset_id.toString(),
        {
          latitude: row.latitude ? Number(row.latitude) : null,
          longitude: row.longitude ? Number(row.longitude) : null,
          geometry_type_code: row.geometry_type_code ?? null,
        },
      ]),
    );
  }

  private mapAssetToDto(
    record: any,
    includeRepair: boolean = false,
    geom?: AssetGeom,
  ): RecreationAssetDto {
    return {
      asset_id: Number(record.asset_id),
      parent_id: record.parent_id ? Number(record.parent_id) : null,
      asset_tag: record.asset_tag ?? null,
      rec_resource_id: record.rec_resource_id,
      asset_code: record.asset_code,
      asset_name: record.asset_name ?? null,
      asset_comment: record.asset_comment ?? null,
      legacy_structure_id: record.legacy_structure_id ?? null,
      asset_length: record.asset_length ? Number(record.asset_length) : null,
      asset_width: record.asset_width ? Number(record.asset_width) : null,
      asset_area: record.asset_area ? Number(record.asset_area) : null,
      actual_value: record.actual_value ? Number(record.actual_value) : null,
      default_value: record.default_value ? Number(record.default_value) : null,
      installation_date: record.installation_date
        ? record.installation_date.toISOString().split('T')[0]
        : null,
      updated_by: record.updated_by ?? null,
      updated_at: record.updated_at ? record.updated_at.toISOString() : null,
      geometry_type_code: geom?.geometry_type_code ?? null,
      latitude: geom?.latitude ?? null,
      longitude: geom?.longitude ?? null,
      recreation_asset_repair: includeRepair
        ? record.recreation_asset_repair.map((r) => this.mapRepairToDto(r))
        : [],
    };
  }

  private mapRepairToDto(record: any): RecreationAssetRepairDto {
    return {
      repair_id: Number(record.repair_id),
      asset_id: Number(record.asset_id),
      recreation_remed_repair_code: record.recreation_remed_repair_code ?? null,
      estimated_repair_cost: record.estimated_repair_cost
        ? Number(record.estimated_repair_cost)
        : null,
      actual_repair_cost: record.actual_repair_cost
        ? Number(record.actual_repair_cost)
        : null,
      repair_completed_date: record.repair_completed_date
        ? record.repair_completed_date.toISOString().split('T')[0]
        : null,
      urgency: record.urgency ?? null,
      trail_segment_start: record.trail_segment_start ?? null,
      trail_segment_end: record.trail_segment_end ?? null,
      created_by: record.created_by ?? null,
      created_at: record.created_at ? record.created_at.toISOString() : null,
      updated_by: record.updated_by ?? null,
      updated_at: record.updated_at ? record.updated_at.toISOString() : null,
    };
  }

  /**
   * Upsert geometry info for an Asset.
   */
  async upsertAssetGeometry(
    asset_id: number,
    geometry_type_code: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    // SRID 4326 represents standard WGS 84 (GPS latitude/longitude)
    await this.prisma.$executeRaw`
    INSERT INTO rst.recreation_asset_geom
      (asset_id, geometry_type_code, geometry, created_at, updated_at)
    VALUES (
      ${asset_id},
      ${geometry_type_code},
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326),
      now(),
      now()
    )
    ON CONFLICT (asset_id) DO UPDATE
    SET
      geometry_type_code = EXCLUDED.geometry_type_code,
      geometry = EXCLUDED.geometry,
      updated_at = now();
  `;
  }
}
