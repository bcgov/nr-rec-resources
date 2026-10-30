import { AppConfigService } from '@/app-config/app-config.service';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

type SncscTokenResponse = {
  access_token?: string;
};

@Injectable()
export class SncscStatusRequestService {
  private readonly logger = new Logger(SncscStatusRequestService.name);

  constructor(private readonly appConfigService: AppConfigService) {}

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

  private async getAccessToken(): Promise<string> {
    this.validateConfig();

    const basicAuthHeader = `Basic ${Buffer.from(
      `${this.appConfigService.sncscIntegrationClientId}:${this.appConfigService.sncscIntegrationClientSecret}`,
    ).toString('base64')}`;

    const requestToken = async ({
      useBasicAuthHeader,
      includeScope,
    }: {
      useBasicAuthHeader: boolean;
      includeScope: boolean;
    }): Promise<Response> => {
      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        ...(includeScope && { scope: 'SNCSC.CREATE_STATUS_REQUEST' }),
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
              client_id: this.appConfigService.sncscIntegrationClientId,
              client_secret: this.appConfigService.sncscIntegrationClientSecret,
            }),
      });
    };

    const tokenRequestAttempts: Array<{
      useBasicAuthHeader: boolean;
      includeScope: boolean;
    }> = [
      { useBasicAuthHeader: true, includeScope: true },
      { useBasicAuthHeader: false, includeScope: true },
      { useBasicAuthHeader: true, includeScope: false },
      { useBasicAuthHeader: false, includeScope: false },
    ];

    let tokenResponse: Response | null = null;
    for (const attempt of tokenRequestAttempts) {
      tokenResponse = await requestToken(attempt);
      console.log('token respose', tokenResponse);
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

  async createStatusRequest(
    payload: Record<string, unknown>,
  ): Promise<string | null> {
    const token = await this.getAccessToken();

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
