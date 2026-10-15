import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfigService } from '@/app-config/app-config.service';
import { BcgwExportService } from './bcgw-export.service';

const JOB_NAME = 'bcgw-export';

/**
 * Registers the BCGW export on a cron schedule.
 *
 * Deliberately thin - all of the work lives in BcgwExportService.run() so the
 * same method can be driven by the manual trigger endpoint, or by a standalone
 * scheduled task later, without touching the export logic.
 *
 * The schedule is registered at runtime rather than with a @Cron decorator so the
 * expression can come from config and the job can be left unregistered entirely
 * when disabled.
 */
@Injectable()
export class BcgwExportScheduler implements OnModuleInit {
  private readonly logger = new Logger(BcgwExportScheduler.name);

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly exportService: BcgwExportService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit(): void {
    if (!this.appConfig.bcgwExportEnabled) {
      this.logger.log(
        'BCGW export schedule disabled (BCGW_EXPORT_ENABLED is not "true")',
      );
      return;
    }

    const cronTime = this.appConfig.bcgwExportCron;
    const job = new CronJob(cronTime, () => {
      void this.runExport();
    });

    this.schedulerRegistry.addCronJob(JOB_NAME, job);
    job.start();

    this.logger.log(`BCGW export scheduled with cron "${cronTime}"`);
  }

  /**
   * Failures are logged rather than rethrown: an unhandled rejection in a cron
   * callback would take the task down, and a missed run is recoverable because
   * the previous export stays in place until the next one succeeds.
   */
  private async runExport(): Promise<void> {
    try {
      await this.exportService.run();
    } catch (error) {
      this.logger.error(
        `Scheduled BCGW export failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
