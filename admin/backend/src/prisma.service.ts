import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, "query">
  implements OnModuleInit, OnModuleDestroy
{
  private static instance: PrismaService;
  private logger = new Logger("PRISMA");
  databaseUrl: string;

  constructor(private configService: ConfigService) {
    if (PrismaService.instance) {
      return PrismaService.instance;
    }

    const DB_HOST = configService.get<string>("POSTGRES_HOST", "localhost");
    const DB_USER = configService.get<string>("POSTGRES_USER", "postgres");
    const DB_PWD = encodeURIComponent(
      configService.get<string>("POSTGRES_PASSWORD", "default"),
    );
    const DB_PORT = configService.get<number>("POSTGRES_PORT", 5432);
    const DB_NAME = configService.get<string>("POSTGRES_DATABASE", "postgres");
    const DB_SCHEMA = configService.get<string>("POSTGRES_SCHEMA", "rst");
    const dataSourceURL = `postgresql://${DB_USER}:${DB_PWD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}&connection_limit=10`;

    super({
      errorFormat: "pretty",
      datasources: {
        db: {
          url: dataSourceURL,
        },
      },
      log: [
        { emit: "event", level: "query" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
    });
    PrismaService.instance = this;
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
