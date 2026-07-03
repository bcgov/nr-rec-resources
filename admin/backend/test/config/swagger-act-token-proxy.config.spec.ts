import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';

const { readStreamTextMock } = vi.hoisted(() => ({
  readStreamTextMock: vi.fn(),
}));

vi.mock('node:stream/consumers', () => ({
  text: readStreamTextMock,
}));

import { createSwaggerActTokenProxyHandler } from '@/config/swagger-act-token-proxy.config';

function createReq(
  options: {
    method?: string;
    contentType?: string;
    authorization?: string;
    body?: unknown;
  } = {},
): Request {
  const {
    method = 'POST',
    contentType = 'application/x-www-form-urlencoded',
    authorization,
    body,
  } = options;

  return {
    method,
    body,
    header: vi.fn((name: string) => {
      if (name === 'content-type') return contentType;
      if (name === 'authorization') return authorization;
      return undefined;
    }),
  } as unknown as Request;
}

function createRes(): Response {
  const res = {
    sendStatus: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
    setHeader: vi.fn(),
    send: vi.fn(),
  };

  res.status.mockReturnValue(res);
  return res as unknown as Response;
}

function createUpstreamResponse(options: {
  status: number;
  body: string;
  contentType?: string;
}) {
  return {
    status: options.status,
    headers: {
      get: vi.fn((name: string) =>
        name.toLowerCase() === 'content-type'
          ? (options.contentType ?? null)
          : null,
      ),
    },
    text: vi.fn(async () => options.body),
  };
}

describe('createSwaggerActTokenProxyHandler', () => {
  const fetchMock = vi.fn();
  const cssTokenUrl =
    'https://test-keycloak.example.com/auth/realms/test-realm/protocol/openid-connect/token';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 204 for OPTIONS requests', async () => {
    const handler = createSwaggerActTokenProxyHandler(cssTokenUrl);
    const req = createReq({ method: 'OPTIONS' });
    const res = createRes();

    await handler(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 405 for non-POST requests', async () => {
    const handler = createSwaggerActTokenProxyHandler(cssTokenUrl);
    const req = createReq({ method: 'GET' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'method_not_allowed' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 415 for non form-urlencoded requests', async () => {
    const handler = createSwaggerActTokenProxyHandler(cssTokenUrl);
    const req = createReq({ contentType: 'application/json' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({ error: 'unsupported_media_type' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 400 when grant_type is not client_credentials', async () => {
    const handler = createSwaggerActTokenProxyHandler(cssTokenUrl);
    const req = createReq({ body: 'grant_type=password' });
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'unsupported_grant_type' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('forwards request to CSS and passes through response details', async () => {
    const handler = createSwaggerActTokenProxyHandler(cssTokenUrl);
    const req = createReq({
      authorization: 'Basic client-secret',
      body: { grant_type: 'client_credentials' },
    });
    const res = createRes();

    fetchMock.mockResolvedValue(
      createUpstreamResponse({
        status: 200,
        body: '{"access_token":"abc"}',
        contentType: 'application/json',
      }),
    );

    await handler(req, res);

    expect(fetchMock).toHaveBeenCalledWith(cssTokenUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        authorization: 'Basic client-secret',
      },
      body: 'grant_type=client_credentials',
    });
    expect(res.setHeader).toHaveBeenCalledWith(
      'content-type',
      'application/json',
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('{"access_token":"abc"}');
  });

  it('uses stream fallback when body is not pre-parsed', async () => {
    const handler = createSwaggerActTokenProxyHandler(cssTokenUrl);
    const req = createReq({ body: undefined });
    const res = createRes();

    readStreamTextMock.mockResolvedValue('grant_type=client_credentials');
    fetchMock.mockResolvedValue(
      createUpstreamResponse({ status: 200, body: 'ok' }),
    );

    await handler(req, res);

    expect(readStreamTextMock).toHaveBeenCalledWith(req);
    expect(fetchMock).toHaveBeenCalledWith(
      cssTokenUrl,
      expect.objectContaining({
        body: 'grant_type=client_credentials',
      }),
    );
  });

  it('returns 502 when CSS token exchange fails', async () => {
    const handler = createSwaggerActTokenProxyHandler(cssTokenUrl);
    const req = createReq({ body: 'grant_type=client_credentials' });
    const res = createRes();

    fetchMock.mockRejectedValue(new Error('upstream failure'));

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({ error: 'token_exchange_failed' });
  });
});
