import { describe, it, expect } from 'vitest';
import { SitemapModule } from './sitemap.module';
import { SitemapService } from './sitemap.service';
import { SitemapController } from './sitemap.controller';

describe('SitemapModule', () => {
  it('should be defined', () => {
    expect(SitemapModule).toBeDefined();
  });

  it('should provide SitemapService', () => {
    expect(SitemapService).toBeDefined();
    expect(typeof SitemapService).toBe('function');
  });

  it('should provide SitemapController', () => {
    expect(SitemapController).toBeDefined();
    expect(typeof SitemapController).toBe('function');
  });
});
