import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppConfigService } from '@/app-config/app-config.service';
import { BcgwExportScheduler } from '@/bcgw/export/bcgw-export.scheduler';
import { BcgwExportService } from '@/bcgw/export/bcgw-export.service';

describe('BcgwExportScheduler', () => {
  let exportService: { run: ReturnType<typeof vi.fn> };
  let schedulerRegistry: { addCronJob: ReturnType<typeof vi.fn> };

  const createScheduler = (enabled: boolean, cron = '0 * * * *') =>
    new BcgwExportScheduler(
      {
        bcgwExportEnabled: enabled,
        bcgwExportCron: cron,
      } as unknown as AppConfigService,
      exportService as unknown as BcgwExportService,
      schedulerRegistry as never,
    );

  beforeEach(() => {
    exportService = { run: vi.fn().mockResolvedValue([]) };
    schedulerRegistry = { addCronJob: vi.fn() };
  });

  it('registers a cron job when enabled', () => {
    createScheduler(true).onModuleInit();

    expect(schedulerRegistry.addCronJob).toHaveBeenCalledOnce();
    expect(schedulerRegistry.addCronJob).toHaveBeenCalledWith(
      'bcgw-export',
      expect.anything(),
    );
  });

  it('registers nothing when disabled', () => {
    createScheduler(false).onModuleInit();

    expect(schedulerRegistry.addCronJob).not.toHaveBeenCalled();
  });

  it('swallows export failures so the task is not taken down', async () => {
    exportService.run.mockRejectedValue(new Error('boom'));
    const scheduler = createScheduler(true);

    await expect(
      (scheduler as unknown as { runExport(): Promise<void> }).runExport(),
    ).resolves.toBeUndefined();
    expect(exportService.run).toHaveBeenCalledOnce();
  });
});
