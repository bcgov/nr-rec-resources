import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SitemapService } from './sitemap.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('SitemapService', () => {
  let service: SitemapService;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeEach(() => {
    prisma = {
      recreation_resource: {
        findMany: vi.fn(),
      },
    } as any;

    config = {
      get: vi.fn(),
    } as any;

    service = new SitemapService(prisma, config);
  });

  it('generates sitemap with static and dynamic pages', async () => {
    (config.get as any).mockReturnValue('https://example.com');
    (prisma.recreation_resource.findMany as any).mockResolvedValue([
      {
        rec_resource_id: 'abc123',
        updated_at: new Date('2024-01-01T12:00:00Z'),
      },
      {
        rec_resource_id: 'def456',
        updated_at: null,
      },
    ]);

    const xml = await service.generateSitemap();

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(xml).toContain('<loc>https://example.com/</loc>');
    expect(xml).toContain('<loc>https://example.com/contact</loc>');
    expect(xml).toContain('<loc>https://example.com/search</loc>');
    expect(xml).toContain('<loc>https://example.com/resource/abc123</loc>');
    expect(xml).toContain('<lastmod>2024-01-01</lastmod>');
    expect(xml).toContain(
      '<loc>https://example.com/resource/abc123/contact</loc>',
    );
    expect(xml).toContain('<loc>https://example.com/resource/def456</loc>');
    expect(xml).toContain(
      '<loc>https://example.com/resource/def456/contact</loc>',
    );
  });

  it('escapes XML special characters in resource id', async () => {
    (config.get as any).mockReturnValue('https://example.com');
    (prisma.recreation_resource.findMany as any).mockResolvedValue([
      {
        rec_resource_id: 'foo&bar<baz>"\'',
        updated_at: new Date('2024-02-02T00:00:00Z'),
      },
    ]);
    const xmlEscaped = await service.generateSitemap();
    expect(xmlEscaped).toContain('foo&amp;bar&lt;baz&gt;&quot;&apos;');
  });

  it('uses default baseUrl if config is missing', async () => {
    (config.get as any).mockReturnValue(undefined);
    (prisma.recreation_resource.findMany as any).mockResolvedValue([]);
    const xml = await service.generateSitemap();
    expect(xml).toContain('<loc>https://www.sitesandtrailsbc.ca/</loc>');
  });

  it('formats date as YYYY-MM-DD', () => {
    const date = new Date('2023-12-31T23:59:59Z');
    const formatted = (service as any).formatDate(date);
    expect(formatted).toBe('2023-12-31');
  });

  it('escapes XML special characters', () => {
    const unsafe = `<tag attr="value">&'`;
    const escaped = (service as any).escapeXml(unsafe);
    expect(escaped).toBe('&lt;tag attr=&quot;value&quot;&gt;&amp;&apos;');
  });
});
