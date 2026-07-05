import { Request, Response } from 'express';
import { text as readStreamText } from 'node:stream/consumers';

export function createSwaggerActTokenProxyHandler(cssTokenUrl: string) {
  return async (req: Request, res: Response): Promise<void> => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }

    const contentType = req.header('content-type') ?? '';
    if (!contentType.includes('application/x-www-form-urlencoded')) {
      res.status(415).json({ error: 'unsupported_media_type' });
      return;
    }

    let formBody: string | Record<string, string>;
    if (typeof req.body === 'string') {
      formBody = req.body;
    } else if (req.body && typeof req.body === 'object') {
      formBody = req.body as Record<string, string>;
    } else {
      formBody = await readStreamText(req);
    }

    const params = new URLSearchParams(formBody);

    if (params.get('grant_type') !== 'client_credentials') {
      res.status(400).json({ error: 'unsupported_grant_type' });
      return;
    }

    const authorization = req.header('authorization');

    try {
      const upstream = await fetch(cssTokenUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          ...(authorization && { authorization }),
        },
        body: params.toString(),
      });

      const upstreamContentType = upstream.headers.get('content-type');
      if (upstreamContentType) {
        res.setHeader('content-type', upstreamContentType);
      }

      res.status(upstream.status).send(await upstream.text());
    } catch {
      res.status(502).json({ error: 'token_exchange_failed' });
    }
  };
}
