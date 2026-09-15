import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppConfigService } from '@/app-config/app-config.service';
import { PrismaService } from '@/prisma.service';
import type { AgreementHolderClientPublicViewDto } from './dtos/agreement-holder-client-public-view.dto';
import type { ClientPublicViewDto } from './dtos/client-public-view.dto';
import { ClientLocationDto } from './dtos/client-location.dto';
import { CreateAgreementHolderDto } from './dtos/create-agreement-holder.dto';
import { UpdateAgreementHolderDto } from './dtos/update-agreement-holder.dto';

type ForestClientPublicView = {
  clientNumber?: string;
  clientName?: string;
  legalFirstName?: string;
  legalMiddleName?: string;
  clientStatusCode?: string;
  clientTypeCode?: string;
  acronym?: string;
};

type ForestClientLocation = Partial<ClientLocationDto>;

type AgreementHolderRecord = {
  agreement_holder_id: number;
  client_number?: string | null;
  agreement_start_date?: Date | null;
  agreement_end_date?: Date | null;
  visible_on_public_website?: boolean;
  partner_relationship_type_code?: string;
  cancelled?: boolean;
};

/** Columns making up an agreement-holder response row. */
const AGREEMENT_HOLDER_SELECT = {
  agreement_holder_id: true,
  client_number: true,
  agreement_start_date: true,
  agreement_end_date: true,
  visible_on_public_website: true,
  partner_relationship_type_code: true,
  cancelled: true,
} as const;

const CLIENT_STATUS_DESCRIPTIONS: Record<string, string> = {
  ACT: 'Active',
  DAC: 'Deactivated',
  DEC: 'Deceased',
  REC: 'Receivership',
  SPN: 'Suspended',
};

const CLIENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  A: 'Association',
  B: 'First Nation Band',
  C: 'Corporation',
  F: 'Ministry of Forests and Range',
  G: 'Government',
  I: 'Individual',
  L: 'Limited Partnership',
  P: 'General Partnership',
  R: 'First Nation Group',
  S: 'Society',
  T: 'First Nation Tribal Council',
  U: 'Unregistered Company',
};

@Injectable()
export class PartnerService {
  constructor(
    private readonly appConfig: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async findClientsByRecResourceId(
    rec_resource_id: string,
  ): Promise<AgreementHolderClientPublicViewDto[]> {
    const resource = await this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
      select: { rec_resource_id: true },
    });

    if (!resource) {
      throw new NotFoundException(
        `Recreation resource with ID ${rec_resource_id} not found`,
      );
    }

    const agreementHolders =
      await this.prisma.recreation_agreement_holder.findMany({
        where: { rec_resource_id },
        orderBy: { agreement_holder_id: 'asc' },
        select: AGREEMENT_HOLDER_SELECT,
      });

    // One response row per agreement-holder row. A holder whose client cannot
    // be resolved in the Forest Client API is still returned, with the client
    // fields blank, so it stays visible and editable in the admin app rather
    // than silently disappearing.
    return Promise.all(
      agreementHolders.map(async (agreementHolder) => {
        const client = agreementHolder.client_number
          ? await this.tryFetchClientByClientNumber(
              agreementHolder.client_number,
            )
          : null;

        return this.buildAgreementHolderClientResponse(
          agreementHolder,
          client ?? {
            clientNumber: agreementHolder.client_number ?? undefined,
          },
        );
      }),
    );
  }

  async searchByAcronymNameNumber(
    page = 0,
    size = 10,
    name?: string,
    acronym?: string,
    number?: string,
  ): Promise<{ data: ClientPublicViewDto[]; totalCount: number | null }> {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('size', String(size));
    if (name) query.set('name', name);
    if (acronym) query.set('acronym', acronym);
    if (number) query.set('number', number);

    const result = await this.fetchJson<ClientPublicViewDto[]>(
      `${this.baseUrl}/api/clients/search/by?${query.toString()}`,
      true,
    );

    return {
      data: (result.body ?? []).map((client) => this.enrichClient(client)),
      totalCount: result.totalCount,
    };
  }

  async searchClient(clientId: string): Promise<ClientPublicViewDto> {
    return this.fetchClientByClientNumber(clientId);
  }

  async createAgreementHolder(
    rec_resource_id: string,
    createDto: CreateAgreementHolderDto,
  ): Promise<AgreementHolderClientPublicViewDto> {
    await this.ensureResourceExists(rec_resource_id);

    // The schema supports multiple partners per resource (V1.1.88); only a
    // repeat of the same client on the same resource is a conflict, and only
    // while that agreement is still running.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const duplicate = await this.prisma.recreation_agreement_holder.findFirst({
      where: {
        rec_resource_id,
        client_number: createDto.clientNumber,
        agreement_end_date: { gte: startOfToday },
      },
      select: { agreement_holder_id: true },
    });

    if (duplicate) {
      throw new ConflictException(
        'This client is already an agreement holder for this recreation resource.',
      );
    }

    const client = await this.fetchClientByClientNumber(createDto.clientNumber);

    const created = await this.prisma.recreation_agreement_holder.create({
      data: {
        rec_resource_id,
        client_number: createDto.clientNumber,
        agreement_start_date: createDto.agreementStartDate
          ? new Date(createDto.agreementStartDate)
          : null,
        agreement_end_date: createDto.agreementEndDate
          ? new Date(createDto.agreementEndDate)
          : null,
        visible_on_public_website: createDto.visible_on_public_website ?? false,
        partner_relationship_type_code:
          createDto.partner_relationship_type_code ?? 'SITE_OPERATOR',
      },
      select: AGREEMENT_HOLDER_SELECT,
    });

    return this.buildAgreementHolderClientResponse(created, client);
  }

  async updateAgreementHolder(
    rec_resource_id: string,
    agreement_holder_id: number,
    updateDto: UpdateAgreementHolderDto,
  ): Promise<AgreementHolderClientPublicViewDto> {
    if (
      updateDto.agreementStartDate === undefined &&
      updateDto.agreementEndDate === undefined &&
      updateDto.visible_on_public_website === undefined &&
      updateDto.partner_relationship_type_code === undefined &&
      updateDto.cancelled === undefined
    ) {
      throw new BadRequestException(
        'At least one updatable agreement-holder field is required.',
      );
    }

    const existing = await this.findOwnedAgreementHolder(
      rec_resource_id,
      agreement_holder_id,
    );

    // Cancelling is one-way. Enforced here rather than only in the UI: this is
    // a plain PUT, so a client could otherwise reverse it directly.
    if (existing.cancelled && updateDto.cancelled === false) {
      throw new BadRequestException(
        'A cancelled agreement cannot be un-cancelled.',
      );
    }

    // A cancelled agreement is frozen: its dates and public-website visibility
    // can no longer change. Deleting it is still allowed, via the delete
    // endpoint.
    if (existing.cancelled) {
      const frozenFields = [
        ['agreementStartDate', updateDto.agreementStartDate],
        ['agreementEndDate', updateDto.agreementEndDate],
        ['visible_on_public_website', updateDto.visible_on_public_website],
      ].filter(([, value]) => value !== undefined);

      if (frozenFields.length > 0) {
        throw new BadRequestException(
          `A cancelled agreement cannot be edited. Remove: ${frozenFields
            .map(([field]) => field)
            .join(', ')}.`,
        );
      }
    }

    const startDate = this.resolveDateUpdate(
      updateDto.agreementStartDate,
      existing.agreement_start_date,
    );
    const endDate = this.resolveDateUpdate(
      updateDto.agreementEndDate,
      existing.agreement_end_date,
    );

    // Compared against the merged record, so editing one date still validates
    // against the other's persisted value.
    if (startDate && endDate && endDate <= startDate) {
      throw new BadRequestException(
        'Agreement end date must be after the agreement start date.',
      );
    }

    const updated = await this.prisma.recreation_agreement_holder.update({
      where: { agreement_holder_id },
      data: {
        agreement_start_date: this.toDateInput(updateDto.agreementStartDate),
        agreement_end_date: this.toDateInput(updateDto.agreementEndDate),
        visible_on_public_website: updateDto.visible_on_public_website,
        partner_relationship_type_code:
          updateDto.partner_relationship_type_code,
        cancelled: updateDto.cancelled,
      },
      select: AGREEMENT_HOLDER_SELECT,
    });

    const client = updated.client_number
      ? await this.fetchClientByClientNumber(updated.client_number)
      : {};

    return this.buildAgreementHolderClientResponse(updated, client);
  }

  async deleteAgreementHolder(
    rec_resource_id: string,
    agreement_holder_id: number,
  ): Promise<void> {
    await this.findOwnedAgreementHolder(rec_resource_id, agreement_holder_id);

    // Hard delete. The temporal versioning trigger fires on delete, so the row
    // is retained in rst.recreation_agreement_holder_history.
    await this.prisma.recreation_agreement_holder.delete({
      where: { agreement_holder_id },
    });
  }

  /**
   * Loads an agreement holder and asserts it belongs to the resource in the
   * path, so a holder cannot be addressed through an unrelated resource id.
   */
  private async findOwnedAgreementHolder(
    rec_resource_id: string,
    agreement_holder_id: number,
  ) {
    const existing = await this.prisma.recreation_agreement_holder.findUnique({
      where: { agreement_holder_id },
      select: { ...AGREEMENT_HOLDER_SELECT, rec_resource_id: true },
    });

    if (!existing || existing.rec_resource_id !== rec_resource_id) {
      throw new NotFoundException(
        `Agreement holder ${agreement_holder_id} not found for recreation resource ${rec_resource_id}`,
      );
    }

    return existing;
  }

  /** Prisma input: undefined leaves the column alone, null clears it. */
  private toDateInput(value?: string | null): Date | null | undefined {
    if (value === undefined) return undefined;
    return value === null ? null : new Date(value);
  }

  /** The value a column will hold after the update, for cross-field checks. */
  private resolveDateUpdate(
    value: string | null | undefined,
    persisted: Date | null | undefined,
  ): Date | null {
    if (value === undefined) return persisted ?? null;
    return value === null ? null : new Date(value);
  }

  async listClientLocations(
    clientNumber: string,
  ): Promise<ClientLocationDto[]> {
    const [clientResult, locations] = await Promise.all([
      this.fetchClientByClientNumber(clientNumber),
      this.fetchAllClientLocations(clientNumber),
    ]);

    return locations.map((location): ClientLocationDto => {
      return {
        ...location,
        clientNumber: this.getClientNumber(
          clientResult,
          location,
          clientNumber,
        ),
        clientName: clientResult.clientName ?? '',
        legalFirstName: clientResult.legalFirstName,
        legalMiddleName: clientResult.legalMiddleName,
        clientStatusCode: clientResult.clientStatusCode,
        clientStatusDescription: this.getClientStatusDescription(
          clientResult.clientStatusCode,
        ),
        clientTypeCode: clientResult.clientTypeCode,
        clientTypeDescription: this.getClientTypeDescription(
          clientResult.clientTypeCode,
        ),
        acronym: clientResult.acronym,
      };
    });
  }

  private get baseUrl(): string {
    return this.appConfig.forestClientApiUrl.replace(/\/+$/, '');
  }

  private get headers() {
    return {
      'X-API-KEY': this.appConfig.forestClientApiKey,
      Accept: 'application/json',
    };
  }

  private async fetchJson<T>(
    url: string,
    captureTotalCount = false,
  ): Promise<{ body: T; totalCount: number | null }> {
    const response = await fetch(url, { headers: this.headers });
    const responseText = await response.text();

    if (!response.ok) {
      throw new HttpException(
        responseText || 'Forest Client API request failed',
        response.status,
      );
    }

    const totalCountHeader = response.headers.get('x-total-count');
    const totalCount = totalCountHeader ? Number(totalCountHeader) : null;
    return {
      body: responseText ? (JSON.parse(responseText) as T) : ([] as T),
      totalCount:
        captureTotalCount && Number.isFinite(totalCount) ? totalCount : null,
    };
  }

  private getClientNumber(
    client: ForestClientPublicView,
    location: ForestClientLocation,
    fallbackClientNumber: string,
  ): string {
    return client.clientNumber ?? location.clientNumber ?? fallbackClientNumber;
  }

  private formatDate(value?: Date): string | undefined {
    return value ? value.toISOString().slice(0, 10) : undefined;
  }

  private buildAgreementHolderClientResponse(
    agreementHolder: AgreementHolderRecord,
    client: ClientPublicViewDto,
  ): AgreementHolderClientPublicViewDto {
    return {
      ...client,
      agreement_holder_id: agreementHolder.agreement_holder_id,
      agreementStartDate: this.formatDate(
        agreementHolder.agreement_start_date ?? undefined,
      ),
      agreementEndDate: this.formatDate(
        agreementHolder.agreement_end_date ?? undefined,
      ),
      visible_on_public_website:
        agreementHolder.visible_on_public_website ?? undefined,
      partner_relationship_type_code:
        agreementHolder.partner_relationship_type_code ?? undefined,
      cancelled: agreementHolder.cancelled ?? false,
    };
  }

  private async fetchClientByClientNumber(
    clientNumber: string,
  ): Promise<ClientPublicViewDto> {
    const result = await this.fetchJson<ForestClientPublicView>(
      `${this.baseUrl}/api/clients/findByClientNumber/${encodeURIComponent(clientNumber)}`,
    );

    return this.enrichClient(result.body ?? {});
  }

  private async tryFetchClientByClientNumber(
    clientNumber: string,
  ): Promise<ClientPublicViewDto | null> {
    try {
      return await this.fetchClientByClientNumber(clientNumber);
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 404) {
        return null;
      }

      throw error;
    }
  }

  private async fetchAllClientLocations(
    clientNumber: string,
  ): Promise<ForestClientLocation[]> {
    const pageSize = 100;
    const allLocations: ForestClientLocation[] = [];
    let page = 0;
    let totalCount: number | null = null;

    while (true) {
      const result = await this.fetchJson<ForestClientLocation[]>(
        `${this.baseUrl}/api/clients/${encodeURIComponent(clientNumber)}/locations?page=${page}&size=${pageSize}`,
        true,
      );
      const pageResults = result.body ?? [];
      allLocations.push(...pageResults);

      if (totalCount === null) {
        totalCount = result.totalCount;
      }

      if (pageResults.length === 0) {
        break;
      }

      if (totalCount !== null && allLocations.length >= totalCount) {
        break;
      }

      if (pageResults.length < pageSize) {
        break;
      }

      page += 1;
    }

    return allLocations;
  }

  private enrichClient(client: ClientPublicViewDto): ClientPublicViewDto {
    return {
      ...client,
      clientStatusDescription: this.getClientStatusDescription(
        client.clientStatusCode,
      ),
      clientTypeDescription: this.getClientTypeDescription(
        client.clientTypeCode,
      ),
    };
  }

  private getClientStatusDescription(code?: string): string | undefined {
    return code ? CLIENT_STATUS_DESCRIPTIONS[code] : undefined;
  }

  private getClientTypeDescription(code?: string): string | undefined {
    return code ? CLIENT_TYPE_DESCRIPTIONS[code] : undefined;
  }

  private async ensureResourceExists(rec_resource_id: string): Promise<void> {
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
}
