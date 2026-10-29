import { AppConfigService } from '@/app-config/app-config.service';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type SncscTokenResponse = {
  access_token?: string;
};

type SncscTokenAttempt = {
  useBasicAuthHeader: boolean;
  includeScope: boolean;
};

@Injectable()
export class SncscStatusRequestService {
  private readonly logger = new Logger(SncscStatusRequestService.name);

  constructor(private readonly appConfigService: AppConfigService) {}

  private async persistOutboundStatusRequest(
    payload: Record<string, unknown>,
  ): Promise<string | null> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logDir = join(process.cwd(), 'logs', 'sncsc-status-requests');
      await mkdir(logDir, { recursive: true });

      const filePath = join(logDir, `status-request-${timestamp}.json`);
      const content = JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          method: 'POST',
          url: this.statusRequestUrl,
          payload,
        },
        null,
        2,
      );

      await writeFile(filePath, content, 'utf8');
      return filePath;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Unable to write SNCSC outbound payload log file: ${message}`,
      );
      return null;
    }
  }

  private get tokenUrl(): string {
    return `${this.appConfigService.sncscBaseUrl.replace(/\/+$/, '')}/oauth2/v1/oauth/token`;
  }

  private get statusRequestUrl(): string {
    return `${this.appConfigService.sncscBaseUrl.replace(/\/+$/, '')}/sncsc-api/v1/statusRequests`;
  }

  private validateConfig(): void {
    if (!this.appConfigService.sncscBaseUrl?.trim()) {
      throw new InternalServerErrorException(
        'SNCSC_BASE_URL is not configured.',
      );
    }

    if (!this.tokenUrl?.trim()) {
      throw new InternalServerErrorException(
        'SNCSC token endpoint is not configured from SNCSC_BASE_URL.',
      );
    }

    if (!this.appConfigService.sncscIntegrationClientId?.trim()) {
      throw new InternalServerErrorException(
        'SNCSC_INTEGRATION_CLIENT_ID is not configured.',
      );
    }
    if (!this.appConfigService.sncscIntegrationClientSecret?.trim()) {
      throw new InternalServerErrorException(
        'SNCSC_INTEGRATION_CLIENT_SECRET is not configured.',
      );
    }
  }

  private validateDmConfig(): void {
    if (!this.appConfigService.sncscBaseUrl?.trim()) {
      throw new InternalServerErrorException(
        'SNCSC_BASE_URL is not configured.',
      );
    }

    if (!this.appConfigService.sncscDmClientId?.trim()) {
      throw new InternalServerErrorException(
        'SNCSC_DM_CLIENT_ID is not configured.',
      );
    }

    if (!this.appConfigService.sncscDmClientSecret?.trim()) {
      throw new InternalServerErrorException(
        'SNCSC_DM_CLIENT_SECRET is not configured.',
      );
    }
  }

  private async requestClientCredentialToken(
    clientId: string,
    clientSecret: string,
    scope: string,
    options?: {
      allowUnscopedFallback?: boolean;
    },
  ): Promise<string> {
    const basicAuthHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;

    const requestToken = async ({
      useBasicAuthHeader,
      includeScope,
    }: SncscTokenAttempt): Promise<Response> => {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        ...(includeScope && { scope }),
      });

      return fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          ...(useBasicAuthHeader && { Authorization: basicAuthHeader }),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: useBasicAuthHeader
          ? params
          : new URLSearchParams({
              ...Object.fromEntries(params.entries()),
              client_id: clientId,
              client_secret: clientSecret,
            }),
      });
    };

    const tokenRequestAttempts: SncscTokenAttempt[] = [
      { useBasicAuthHeader: true, includeScope: true },
      { useBasicAuthHeader: false, includeScope: true },
      ...(options?.allowUnscopedFallback === false
        ? []
        : [
            { useBasicAuthHeader: true, includeScope: false },
            { useBasicAuthHeader: false, includeScope: false },
          ]),
    ];

    let tokenResponse: Response | null = null;
    for (const attempt of tokenRequestAttempts) {
      tokenResponse = await requestToken(attempt);
      if (tokenResponse.ok) {
        break;
      }
    }

    if (!tokenResponse || !tokenResponse.ok) {
      const responseText = tokenResponse
        ? await tokenResponse.text()
        : 'No token response received';
      this.logger.error(
        `SNCSC token request failed (${this.tokenUrl}): ${tokenResponse?.status ?? 'n/a'} ${tokenResponse?.statusText ?? 'n/a'} - ${responseText}`,
      );
      throw new BadGatewayException('Unable to obtain SNCSC access token.');
    }

    const parsed = (await tokenResponse.json()) as SncscTokenResponse;
    if (!parsed.access_token) {
      throw new BadGatewayException(
        'SNCSC token response missing access_token.',
      );
    }

    return parsed.access_token;
  }

  private async getAccessToken(): Promise<string> {
    this.validateConfig();
    return this.requestClientCredentialToken(
      this.appConfigService.sncscIntegrationClientId,
      this.appConfigService.sncscIntegrationClientSecret,
      'SNCSC.CREATE_STATUS_REQUEST',
    );
  }

  private async getDmAccessToken(): Promise<string> {
    this.validateDmConfig();

    return this.requestClientCredentialToken(
      this.appConfigService.sncscDmClientId,
      this.appConfigService.sncscDmClientSecret,
      'DMS.DOC_VIEWER_CONTENT',
      { allowUnscopedFallback: false },
    );
  }

  async fetchAdjudicationReportContent(
    adjudicationReportDocumentUri: string,
  ): Promise<{ contentType: string; content: Buffer }> {
    const token = await this.getDmAccessToken();
    const url = `${adjudicationReportDocumentUri.replace(/\/+$/, '')}/content`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf, application/octet-stream',
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      this.logger.error(
        `SNCSC adjudication report fetch failed: ${response.status} ${response.statusText} - ${responseText}`,
      );
      throw new BadGatewayException(
        'Unable to fetch SNCSC adjudication report.',
      );
    }

    const bytes = await response.arrayBuffer();
    return {
      contentType: 'application/pdf',
      content: Buffer.from(bytes),
    };
  }

  async createStatusRequest(
    payload: Record<string, unknown>,
  ): Promise<string | null> {
    const token = await this.getAccessToken();
    const payloadLogFile = await this.persistOutboundStatusRequest(payload);

    // Helpful request-boundary log for troubleshooting SNCSC payload issues.
    console.log(
      'SNCSC createStatusRequest outbound payload:',
      JSON.stringify(
        {
          method: 'POST',
          url: this.statusRequestUrl,
          ...(payloadLogFile ? { payloadLogFile } : {}),
          payload,
        },
        null,
        2,
      ),
    );

    const response = await fetch(this.statusRequestUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      this.logger.error(
        `SNCSC status request failed: ${response.status} ${response.statusText} - ${responseText}`,
      );
      throw new BadGatewayException('Unable to create SNCSC status request.');
    }

    const parsed = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    return (
      (typeof parsed.statusRequestGuid === 'string' &&
        parsed.statusRequestGuid) ||
      (typeof parsed.status_request_guid === 'string' &&
        parsed.status_request_guid) ||
      (typeof parsed.guid === 'string' && parsed.guid) ||
      null
    );
  }
}
