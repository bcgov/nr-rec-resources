import { describe, it, expect, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppConfigService } from '@/app-config/app-config.service';
import { BcgwExportService } from '@/bcgw/export/bcgw-export.service';

describe('BcgwExportService', () => {
  describe('run', () => {
    // BCGW_EXPORTS_BUCKET is optional config, so the injected S3Service is null on
    // an environment that does not run the export job. Refreshing the materialized
    // views takes ~30s, so the guard has to come before any of that work.
    it('fails before touching the database when no export bucket is configured', async () => {
      const databaseUrl = vi.fn(() => 'postgresql://unused');
      const appConfig = {
        get databaseUrl() {
          return databaseUrl();
        },
      } as unknown as AppConfigService;

      const service = new BcgwExportService(appConfig, null);

      await expect(service.run()).rejects.toThrow(ServiceUnavailableException);
      expect(databaseUrl).not.toHaveBeenCalled();
    });
  });
});
