import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { AppConfigService } from "./app-config/app-config.service";

@Injectable()
class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, "query">
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  public readonly databaseUrl: string;

  constructor(private readonly appConfigService: AppConfigService) {
    const databaseUrl = appConfigService.databaseUrl;

    // Initialize PrismaClient with configuration
    super({
      errorFormat: "pretty",
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
    });

    this.databaseUrl = databaseUrl;

    this.logger.log("PrismaService initialized successfully");
  }

  async onModuleInit() {
    await this.$connect();
    this.$on<any>("query", (e: Prisma.QueryEvent) => {
      // dont print the health check queries
      if (e?.query?.includes("SELECT 1")) return;
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
