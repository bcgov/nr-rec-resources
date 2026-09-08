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
  client_number?: string | null;
  agreement_start_date?: Date | null;
  agreement_end_date?: Date | null;
};

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

    const agreementHolder =
      await this.prisma.recreation_agreement_holder.findUnique({
        where: { rec_resource_id },
        select: {
          client_number: true,
          agreement_start_date: true,
          agreement_end_date: true,
        },
      });

    const clientIds = this.normalizeIds(
      agreementHolder?.client_number ?? undefined,
    );

    if (clientIds.length === 0) {
      return [];
    }

    const clients = await Promise.all(
      clientIds.map((clientId) => this.tryFetchClientByClientNumber(clientId)),
    );

    return clients
      .filter((client): client is ClientPublicViewDto => client !== null)
      .map((client) => ({
        ...client,
        agreementStartDate: this.formatDate(
          agreementHolder?.agreement_start_date ?? undefined,
        ),
        agreementEndDate: this.formatDate(
          agreementHolder?.agreement_end_date ?? undefined,
        ),
      }));
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

    const existing = await this.prisma.recreation_agreement_holder.findUnique({
      where: { rec_resource_id },
      select: {
        client_number: true,
        agreement_start_date: true,
        agreement_end_date: true,
      },
    });

    if (existing?.client_number === createDto.clientNumber) {
      throw new ConflictException(
        'Agreement holder already exists for this recreation resource and client id.',
      );
    }

    if (existing) {
      throw new ConflictException(
        'Agreement holder already exists for this recreation resource. Use edit to update the dates or client assignment.',
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
      },
      select: {
        client_number: true,
        agreement_start_date: true,
        agreement_end_date: true,
      },
    });

    return this.buildAgreementHolderClientResponse(created, client);
  }

  async updateAgreementHolder(
    rec_resource_id: string,
    updateDto: UpdateAgreementHolderDto,
  ): Promise<AgreementHolderClientPublicViewDto> {
    if (
      updateDto.agreementStartDate === undefined &&
      updateDto.agreementEndDate === undefined
    ) {
      throw new BadRequestException(
        'At least one of agreementStartDate or agreementEndDate is required.',
      );
    }

    const existing = await this.prisma.recreation_agreement_holder.findUnique({
      where: { rec_resource_id },
      select: {
        client_number: true,
        agreement_start_date: true,
        agreement_end_date: true,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Agreement holder for recreation resource ${rec_resource_id} not found`,
      );
    }

    const updated = await this.prisma.recreation_agreement_holder.update({
      where: { rec_resource_id },
      data: {
        agreement_start_date:
          updateDto.agreementStartDate !== undefined
            ? new Date(updateDto.agreementStartDate)
            : undefined,
        agreement_end_date:
          updateDto.agreementEndDate !== undefined
            ? new Date(updateDto.agreementEndDate)
            : undefined,
      },
      select: {
        client_number: true,
        agreement_start_date: true,
        agreement_end_date: true,
      },
    });

    const client = updated.client_number
      ? await this.fetchClientByClientNumber(updated.client_number)
      : {};

    return this.buildAgreementHolderClientResponse(updated, client);
  }

  async listClientLocations(
    clientNumber: string,
  ): Promise<ClientLocationDto[]> {
    const [clientResult, locations] = await Promise.all([
      this.fetchClientByClientNumber(clientNumber),
      this.fetchAllClientLocations(clientNumber),
    ]);

    return locations.map(
      (location): ClientLocationDto => ({
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
      }),
    );
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

  private normalizeIds(id?: string | string[]): string[] {
    if (!id) return [];

    const rawValues = Array.isArray(id) ? id : [id];

    return rawValues
      .flatMap((value) => this.expandIdValue(value))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private expandIdValue(value: string): string[] {
    if (!value) {
      return [];
    }

    const trimmedValue = value.trim();

    if (trimmedValue.includes('id=')) {
      const query = trimmedValue.startsWith('?')
        ? trimmedValue.slice(1)
        : trimmedValue;
      const parsedIds = new URLSearchParams(query).getAll('id');

      if (parsedIds.length > 0) {
        return parsedIds;
      }
    }

    if (trimmedValue.includes(',')) {
      return trimmedValue.split(',');
    }

    return [trimmedValue];
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
      agreementStartDate: this.formatDate(
        agreementHolder.agreement_start_date ?? undefined,
      ),
      agreementEndDate: this.formatDate(
        agreementHolder.agreement_end_date ?? undefined,
      ),
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
