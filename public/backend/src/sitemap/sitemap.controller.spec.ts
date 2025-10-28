import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';

describe('SitemapController', () => {
  let controller: SitemapController;
  let service: SitemapService;

  beforeEach(() => {
    service = {
      generateSitemap: vi.fn(),
    } as any;
    controller = new SitemapController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return sitemap XML from service', async () => {
    const xml = '<?xml version="1.0"?><urlset></urlset>';
    (service.generateSitemap as any).mockResolvedValue(xml);

    const result = await controller.getSitemap();
    expect(result).toBe(xml);
    expect(service.generateSitemap).toHaveBeenCalled();
  });
});
