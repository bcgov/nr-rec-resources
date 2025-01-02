import {
  DynamicModule,
  Module,
  ModuleMetadata,
  Provider,
  Type,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma";

interface PrismaModuleOptions {
  isGlobal?: boolean;
  prismaServiceOptions?: PrismaServiceOptions;
}

interface PrismaServiceOptions {
  prismaOptions?: Prisma.PrismaClientOptions;
  explicitConnect?: boolean;
  middlewares?: Array<Prisma.Middleware>;
}

interface PrismaOptionsFactory {
  createPrismaOptions(): Promise<PrismaServiceOptions> | PrismaServiceOptions;
}

export interface PrismaModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  isGlobal?: boolean;
  useExisting?: Type<PrismaOptionsFactory>;
  useClass?: Type<PrismaOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<PrismaServiceOptions> | PrismaServiceOptions;
  inject?: any[];
}

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
class PrismaModule {
  static forRoot(options: PrismaModuleOptions = {}): DynamicModule {
    return {
      global: options.isGlobal,
      module: PrismaModule,
      providers: [
        {
          provide: "PRISMA_SERVICE_OPTIONS",
          useValue: options.prismaServiceOptions,
        },
      ],
    };
  }

  static forRootAsync(options: PrismaModuleAsyncOptions): DynamicModule {
    return {
      global: options.isGlobal,
      module: PrismaModule,
      imports: options.imports || [],
      providers: this.createAsyncProviders(options),
    };
  }

  private static createAsyncProviders(
    options: PrismaModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return this.createAsyncOptionsProvider(options);
    }

    return [
      ...this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: PrismaModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: "PRISMA_SERVICE_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }
    return [
      {
        provide: "PRISMA_SERVICE_OPTIONS",
        useFactory: async (optionsFactory: PrismaOptionsFactory) =>
          await optionsFactory.createPrismaOptions(),
        inject: [options.useExisting || options.useClass],
      },
    ];
  }
}

export { PrismaModule };
