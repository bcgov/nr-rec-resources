import { AppConfigService } from '@/app-config/app-config.service';
import { SncscStatusRequestService } from '@/sncsc/sncsc-status-request.service';
import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type MockResponseArgs = {
  ok: boolean;
  status?: number;
  statusText?: string;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

const mockResponse = ({
  ok,
  status = ok ? 200 : 500,
  statusText = ok ? 'OK' : 'Error',
  json,
  text,
}: MockResponseArgs): Response =>
  ({
    ok,
    status,
    statusText,
    json: json ?? (async () => ({})),
    text: text ?? (async () => ''),
  }) as unknown as Response;

describe('SncscStatusRequestService', () => {
  let service: SncscStatusRequestService;
  let appConfigMock: AppConfigService;

  beforeEach(() => {
    vi.clearAllMocks();

    appConfigMock = {
      sncscBaseUrl: 'https://sncsc.example.com///',
      sncscIntegrationClientId: 'client-id',
      sncscIntegrationClientSecret: 'client-secret',
    } as AppConfigService;

    service = new SncscStatusRequestService(appConfigMock);
  });

  it('throws when SNCSC_BASE_URL is missing', async () => {
    appConfigMock.sncscBaseUrl = '   ';

    await expect(service.createStatusRequest({})).rejects.toThrow(
      new InternalServerErrorException('SNCSC_BASE_URL is not configured.'),
    );
  });

  it('throws when SNCSC integration client id is missing', async () => {
    appConfigMock.sncscIntegrationClientId = ' ';

    await expect(service.createStatusRequest({})).rejects.toThrow(
      new InternalServerErrorException(
        'SNCSC_INTEGRATION_CLIENT_ID is not configured.',
      ),
    );
  });

  it('throws when SNCSC integration client secret is missing', async () => {
    appConfigMock.sncscIntegrationClientSecret = ' ';

    await expect(service.createStatusRequest({})).rejects.toThrow(
      new InternalServerErrorException(
        'SNCSC_INTEGRATION_CLIENT_SECRET is not configured.',
      ),
    );
  });

  it('retries token strategies and creates a status request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => 'basic with scope rejected',
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          json: async () => ({ access_token: 'token-123' }),
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          json: async () => ({ statusRequestGuid: 'guid-abc' }),
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    const result = await service.createStatusRequest({ payload: 'value' });

    expect(result).toBe('guid-abc');
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const firstTokenCall = fetchMock.mock.calls[0];
    const secondTokenCall = fetchMock.mock.calls[1];

    expect(firstTokenCall?.[0]).toBe(
      'https://sncsc.example.com/oauth2/v1/oauth/token',
    );
    expect((firstTokenCall?.[1] as RequestInit)?.headers).toMatchObject({
      Authorization: expect.stringMatching(/^Basic\s+/),
    });

    expect((secondTokenCall?.[1] as RequestInit)?.headers).not.toMatchObject({
      Authorization: expect.any(String),
    });
  });

  it('throws BadGatewayException when all token attempts fail', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'all token attempts failed',
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(service.createStatusRequest({})).rejects.toThrow(
      new BadGatewayException('Unable to obtain SNCSC access token.'),
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('falls back through all token strategies before succeeding', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => 'attempt 1 failed',
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => 'attempt 2 failed',
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          text: async () => 'attempt 3 failed',
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({ ok: true, json: async () => ({ access_token: 't4' }) }),
      )
      .mockResolvedValueOnce(
        mockResponse({ ok: true, json: async () => ({ guid: 'status-guid' }) }),
      );

    vi.stubGlobal('fetch', fetchMock);

    await expect(service.createStatusRequest({})).resolves.toBe('status-guid');
    expect(fetchMock).toHaveBeenCalledTimes(5);

    const fourthTokenCall = fetchMock.mock.calls[3];
    expect((fourthTokenCall?.[1] as RequestInit)?.headers).not.toMatchObject({
      Authorization: expect.any(String),
    });
  });

  it('throws when token response has no access_token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({ ok: true, json: async () => ({}) }),
      );

    vi.stubGlobal('fetch', fetchMock);

    await expect(service.createStatusRequest({})).rejects.toThrow(
      new BadGatewayException('SNCSC token response missing access_token.'),
    );
  });

  it('throws when status request endpoint returns non-2xx', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          json: async () => ({ access_token: 'token-123' }),
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: false,
          status: 502,
          statusText: 'Bad Gateway',
          text: async () => 'downstream failed',
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    await expect(service.createStatusRequest({})).rejects.toThrow(
      new BadGatewayException('Unable to create SNCSC status request.'),
    );
  });

  it.each([
    [{ statusRequestGuid: 'guid-one' }, 'guid-one'],
    [{ status_request_guid: 'guid-two' }, 'guid-two'],
    [{ guid: 'guid-three' }, 'guid-three'],
    [{}, null],
  ])(
    'returns normalized guid from SNCSC response: %j',
    async (statusResponse, expectedGuid) => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          mockResponse({
            ok: true,
            json: async () => ({ access_token: 'token-xyz' }),
          }),
        )
        .mockResolvedValueOnce(
          mockResponse({
            ok: true,
            json: async () => statusResponse,
          }),
        );

      vi.stubGlobal('fetch', fetchMock);

      await expect(service.createStatusRequest({})).resolves.toBe(expectedGuid);
    },
  );

  it('returns null when status request body is not valid JSON', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          json: async () => ({ access_token: 'token-xyz' }),
        }),
      )
      .mockResolvedValueOnce(
        mockResponse({
          ok: true,
          json: async () => {
            throw new Error('invalid JSON');
          },
        }),
      );

    vi.stubGlobal('fetch', fetchMock);

    await expect(service.createStatusRequest({})).resolves.toBeNull();
  });
});
