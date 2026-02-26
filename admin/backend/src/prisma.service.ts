import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppConfigService } from './app-config/app-config.service';
import { UserContextService } from './common/modules/user-context/user-context.service';
import { createAuditExtension } from '@/prisma/audit.extension';

@Injectable()
class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  public readonly databaseUrl: string;

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly userContext: UserContextService,
  ) {
    const databaseUrl = appConfigService.databaseUrl;
    const dbSchema = appConfigService.databaseSchema;
    const adapter = new PrismaPg({
      connectionString: databaseUrl,
      schema: dbSchema,
      options: `-c search_path=${dbSchema},public`,
    });

    super({
      errorFormat: 'pretty',
      adapter,
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });

    this.databaseUrl = databaseUrl;

    // Apply audit extension
    const auditExtension = createAuditExtension(this.userContext);
    Object.assign(this, this.$extends(auditExtension));

    this.logger.log('PrismaService initialized with audit extension');
  }

  async onModuleInit() {
    await this.$connect();

    // Query logging
    (this as any).$on('query', (e: Prisma.QueryEvent) => {
      if (e.query.includes('SELECT 1')) return;
      this.logger.log(
        `Query: ${e.query} - Params: ${e.params} - Duration: ${e.duration}ms`,
      );
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export { PrismaService };
