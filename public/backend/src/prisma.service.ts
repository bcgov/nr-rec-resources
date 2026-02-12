import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppConfigService } from 'src/app-config/app-config.service';

@Injectable()
class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private static instance: PrismaService;
  private logger = new Logger('PRISMA');
  databaseUrl: string;

  constructor(appConfig: AppConfigService) {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }
    const dataSourceURL = appConfig.databaseUrl;
    const dbSchema = appConfig.databaseSchema;
    const adapter = new PrismaPg({
      connectionString: dataSourceURL,
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
    PrismaService.instance = this;
  }

  async onModuleInit() {
    await this.$connect();
    this.$on<any>('query', (e: Prisma.QueryEvent) => {
      // dont print the health check queries
      if (e?.query?.includes('SELECT 1')) return;
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
